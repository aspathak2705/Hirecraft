/**
 * textAnalysis.js
 * Utility helpers for analyzing professional narrative text for impact language, metrics, and specialization.
 */

// Action verbs signifying high impact
const IMPACT_VERBS = [
  'increased', 'reduced', 'improved', 'optimized', 'automated', 'built',
  'designed', 'led', 'delivered', 'scaled', 'saved', 'spearheaded',
  'architected', 'transformed', 'generated', 'launched', 'championed'
];

/**
 * Detects presence of quantitative evidence (numbers, percentages, currency, scale) in text
 * @param {string} text 
 * @returns {object} { count: number, matches: Array<string> }
 */
export function detectQuantitativeMetrics(text) {
  if (!text) return { count: 0, matches: [] };
  
  // Regex to match percentages, numbers with +, currency ($ / ₹ / € / £ / lakhs / crores / M / K), scale metrics (3x, 50+)
  const metricRegex = /(\d+(?:\.\d+)?%\s*|\b\d+\+\b|\$[\d,]+|\b₹\s*[\d,]+|\b\d+\s*(?:lakhs?|crores?|k|m|b)\b|\b\d+x\b|\b\d+\s*(?:users|clients|customers|percent|hours|days|team members)\b)/gi;
  
  const matches = text.match(metricRegex) || [];
  return {
    count: matches.length,
    matches: Array.from(new Set(matches))
  };
}

/**
 * Evaluates impact verb density in text
 * @param {string} text 
 * @returns {object} { count: number, matches: Array<string> }
 */
export function detectImpactVerbs(text) {
  if (!text) return { count: 0, matches: [] };
  const lower = text.toLowerCase();
  const found = IMPACT_VERBS.filter(verb => lower.includes(verb));
  return {
    count: found.length,
    matches: found
  };
}

/**
 * Evaluates text length & depth quality
 * @param {string} text 
 * @returns {number} score between 0 and 100
 */
export function evaluateTextDepth(text) {
  if (!text || !text.trim()) return 0;
  const words = text.trim().split(/\s+/).length;
  if (words < 5) return 20;
  if (words < 15) return 55;
  if (words < 35) return 80;
  return 95;
}
