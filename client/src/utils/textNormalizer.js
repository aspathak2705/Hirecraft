/**
 * textNormalizer.js
 * Clean, preserve, and normalize raw extracted document text without losing original bullet semantics or numbers.
 */

/**
 * Normalizes document text for section parsing and deterministic evidence extraction
 * @param {string} text 
 * @returns {string} Normalized text string
 */
export function normalizeText(text) {
  if (!text || typeof text !== 'string') return '';

  return text
    // Replace non-standard whitespace / non-breaking space
    .replace(/[\r\t\f\v]/g, '\n')
    .replace(/\u00A0/g, ' ')
    // Remove null bytes or control characters
    .replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Normalize bullet characters to standard dash -
    .replace(/[•●▪▪■◆◦⁃]/g, '- ')
    // Normalize multiple horizontal spaces to single space
    .replace(/[ \t]{2,}/g, ' ')
    // Normalize multiple vertical blank lines to double newlines (section boundaries)
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
