/**
 * evidenceService.js
 * Deterministic evidence extraction engine.
 * Converts normalized document text into traceable evidence items.
 */

import { detectQuantitativeMetrics, detectImpactVerbs } from '../utils/textAnalysis';
import { TECH_VOCABULARY } from '../utils/technologyVocabulary';
import { detectResumeSections } from '../utils/resumeSections';

/**
 * Extracts structured evidence items from normalized resume text.
 * @param {string} normalizedText 
 * @param {string} documentId 
 * @param {string} sessionId 
 * @returns {object} { sections: Array, evidenceItems: Array, stats: object }
 */
export function extractEvidenceFromDocument(normalizedText, documentId = null, sessionId = null) {
  if (!normalizedText) {
    return { sections: [], evidenceItems: [], stats: { total: 0 } };
  }

  const sections = detectResumeSections(normalizedText);
  const evidenceItems = [];

  // 1. Quantitative Evidence Signals
  const metrics = detectQuantitativeMetrics(normalizedText);
  metrics.matches.forEach((metricText) => {
    evidenceItems.push({
      diagnostic_session_id: sessionId,
      document_id: documentId,
      evidence_type: 'quantitative_metric',
      category: 'Impact Metrics',
      source_text: metricText,
      normalized_text: metricText,
      confidence: 'high',
      metadata: { metric: metricText }
    });
  });

  // 2. Impact Language Signals
  const verbs = detectImpactVerbs(normalizedText);
  verbs.matches.forEach((verb) => {
    evidenceItems.push({
      diagnostic_session_id: sessionId,
      document_id: documentId,
      evidence_type: 'impact_signal',
      category: 'Action Verbs',
      source_text: verb,
      normalized_text: verb,
      confidence: 'high',
      metadata: { verb }
    });
  });

  // 3. Technology / Skill Signals
  TECH_VOCABULARY.forEach((item) => {
    // Regex boundary match
    const regex = new RegExp(`\\b${item.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(normalizedText)) {
      evidenceItems.push({
        diagnostic_session_id: sessionId,
        document_id: documentId,
        evidence_type: 'technology',
        category: item.category,
        source_text: item.name,
        normalized_text: item.name,
        confidence: 'high',
        metadata: { technology: item.name, category: item.category }
      });
    }
  });

  // 4. Section-based Experience & Project Evidence
  sections.forEach((sec) => {
    if (sec.section_type === 'experience' || sec.section_type === 'projects') {
      const bullets = sec.content.split('\n').map(l => l.trim()).filter(l => l.length > 10);
      bullets.forEach((bullet) => {
        evidenceItems.push({
          diagnostic_session_id: sessionId,
          document_id: documentId,
          evidence_type: sec.section_type === 'experience' ? 'experience' : 'project',
          category: sec.section_title,
          source_text: bullet.substring(0, 200),
          normalized_text: bullet,
          confidence: 'medium',
          metadata: { section: sec.section_type }
        });
      });
    }
  });

  const stats = {
    total: evidenceItems.length,
    quantitativeCount: metrics.matches.length,
    impactCount: verbs.matches.length,
    technologyCount: evidenceItems.filter(e => e.evidence_type === 'technology').length,
    sectionCount: sections.length
  };

  return {
    sections,
    evidenceItems,
    stats
  };
}
