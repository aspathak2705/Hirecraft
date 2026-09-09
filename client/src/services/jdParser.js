/**
 * jdParser.js
 * Deterministic Job Description structuring & evidence alignment module.
 */

import { TECH_VOCABULARY } from '../utils/technologyVocabulary';
import { normalizeText } from '../utils/textNormalizer';

/**
 * Extracts key signals (skills, responsibilities, domain terms) from JD text.
 * @param {string} rawJdText 
 * @returns {object} Structured JD object
 */
export function parseJobDescription(rawJdText) {
  if (!rawJdText || typeof rawJdText !== 'string') {
    return {
      normalizedText: '',
      required_skills: [],
      domain_terms: [],
      experience_requirements: null
    };
  }

  const normalizedText = normalizeText(rawJdText);
  const foundSkills = [];

  // Match technology signals in JD
  TECH_VOCABULARY.forEach((item) => {
    const regex = new RegExp(`\\b${item.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(normalizedText)) {
      foundSkills.push(item.name);
    }
  });

  // Match experience years requirement (e.g. 5+ years, 3-5 years)
  const expMatch = normalizedText.match(/\b(\d+\+?\s*(?:-\s*\d+)?\s*(?:years?|yrs?))\b/i);

  return {
    normalizedText,
    required_skills: Array.from(new Set(foundSkills)),
    experience_requirements: expMatch ? expMatch[0] : null
  };
}

/**
 * Deterministically compares JD technology signals against candidate resume evidence items.
 * @param {object} structuredJD 
 * @param {Array<object>} candidateEvidenceItems 
 * @returns {object} { matchedSignals: Array, unverifiedSignals: Array, coveragePercentage: number }
 */
export function compareEvidenceWithJD(structuredJD, candidateEvidenceItems = []) {
  if (!structuredJD || !structuredJD.required_skills || structuredJD.required_skills.length === 0) {
    return { matchedSignals: [], unverifiedSignals: [], coveragePercentage: 0 };
  }

  const candidateSkills = new Set(
    candidateEvidenceItems
      .filter(item => item.evidence_type === 'technology')
      .map(item => item.normalized_text.toLowerCase())
  );

  const matchedSignals = [];
  const unverifiedSignals = [];

  structuredJD.required_skills.forEach((skill) => {
    if (candidateSkills.has(skill.toLowerCase())) {
      matchedSignals.push(skill);
    } else {
      unverifiedSignals.push(skill);
    }
  });

  const total = structuredJD.required_skills.length;
  const coveragePercentage = total > 0 ? Math.round((matchedSignals.length / total) * 100) : 0;

  return {
    matchedSignals,
    unverifiedSignals,
    coveragePercentage
  };
}
