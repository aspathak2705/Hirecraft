/**
 * documentParser.js
 * Deterministic text extractor for PDF, DOCX, TXT documents.
 * Client-side browser reader with zero external LLM dependency.
 */

import { normalizeText } from '../utils/textNormalizer';

/**
 * Extracts raw and normalized text from a File object.
 * @param {File} file 
 * @returns {Promise<object>} { rawText, normalizedText, length, status, error }
 */
export async function extractDocumentText(file) {
  if (!file) {
    return { rawText: '', normalizedText: '', length: 0, status: 'failed', error: 'No file provided.' };
  }

  const fileName = file.name || '';
  const ext = fileName.split('.').pop().toLowerCase();

  try {
    let rawText = '';

    if (ext === 'txt') {
      rawText = await file.text();
    } else if (ext === 'pdf') {
      rawText = await extractPDFText(file);
    } else if (ext === 'docx' || ext === 'doc') {
      rawText = await extractDOCXText(file);
    } else {
      rawText = await file.text();
    }

    const normalizedText = normalizeText(rawText);

    if (!normalizedText || normalizedText.trim().length === 0) {
      return {
        rawText: '',
        normalizedText: '',
        length: 0,
        status: 'failed',
        error: 'This document does not contain machine-readable text (it may be an image-only scan or password protected).'
      };
    }

    return {
      rawText,
      normalizedText,
      length: normalizedText.length,
      status: 'processed',
      error: null
    };

  } catch (err) {
    console.warn('Document extraction fallback:', err.message);
    return {
      rawText: '',
      normalizedText: '',
      length: 0,
      status: 'failed',
      error: `Extraction error: ${err.message}`
    };
  }
}

/**
 * Fallback browser PDF text reader
 */
async function extractPDFText(file) {
  // Read array buffer
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  const textDecoder = new TextDecoder('utf-8');
  const fullText = textDecoder.decode(bytes);

  // Extract text inside PDF parenthesis operators: (text) Tj or (text) TJ
  const matches = fullText.match(/\(([^)]+)\)\s*(?:Tj|TJ)/g) || [];
  if (matches.length > 0) {
    return matches.map(m => m.replace(/^\(/, '').replace(/\)\s*(?:Tj|TJ)$/, '')).join(' ');
  }

  // Fallback regex to capture ASCII strings > 4 chars
  const asciiMatches = fullText.match(/[\x20-\x7E]{5,}/g) || [];
  return asciiMatches.join('\n');
}

/**
 * Fallback browser DOCX text reader
 */
async function extractDOCXText(file) {
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  const textDecoder = new TextDecoder('utf-8');
  const xmlContent = textDecoder.decode(bytes);

  // Extract text inside Word XML tags <w:t>text</w:t>
  const matches = xmlContent.match(/<w:t[^>]*>([^<]+)<\/w:t>/g) || [];
  if (matches.length > 0) {
    return matches.map(m => m.replace(/<w:t[^>]*>/, '').replace(/<\/w:t>/, '')).join(' ');
  }

  const asciiMatches = xmlContent.match(/[\x20-\x7E]{6,}/g) || [];
  return asciiMatches.join('\n');
}
