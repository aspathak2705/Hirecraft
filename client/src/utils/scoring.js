/**
 * scoring.js
 * Deterministic scoring function for Career Positioning Diagnostic
 */
import { detectQuantitativeMetrics, detectImpactVerbs, evaluateTextDepth } from './textAnalysis';

/**
 * Calculates 4 strategic positioning dimension scores based on user inputs
 * @param {object} formData 
 * @returns {object} { direction: number, evidence: number, alignment: number, differentiation: number }
 */
export function calculatePositioningScores(formData) {
  const {
    target_role,
    opportunity_timeline,
    career_stage,
    achievement_context = '',
    problem_solving_context = '',
    recruiter_memory_context = '',
    underselling_context = '',
    resume_url,
    jd_text = '',
    jd_url,
    linkedin_url,
    portfolio_url,
    github_url
  } = formData;

  // 1. Career Direction Clarity (Base: 40)
  let direction = 40;
  if (target_role && target_role.trim().length > 2) direction += 30;
  if (opportunity_timeline && opportunity_timeline !== 'Exploring for the Future') direction += 15;
  if (evaluateTextDepth(recruiter_memory_context) > 50) direction += 15;

  // 2. Evidence of Impact (Base: 35)
  let evidence = 35;
  if (resume_url) evidence += 20;
  
  const allContextText = `${achievement_context} ${problem_solving_context} ${underselling_context}`;
  const metrics = detectQuantitativeMetrics(allContextText);
  const verbs = detectImpactVerbs(allContextText);
  
  evidence += Math.min(25, metrics.count * 8);
  evidence += Math.min(20, verbs.count * 5);

  // 3. Opportunity Alignment (Base: 30)
  let alignment = 30;
  if (jd_text && jd_text.trim().length > 50) alignment += 35;
  else if (jd_url) alignment += 30;
  
  if (target_role && target_role.trim()) alignment += 20;
  if (evaluateTextDepth(problem_solving_context) > 50) alignment += 15;

  // 4. Professional Differentiation (Base: 35)
  let differentiation = 35;
  if (linkedin_url && linkedin_url.trim()) differentiation += 15;
  if (portfolio_url && portfolio_url.trim()) differentiation += 15;
  if (github_url && github_url.trim()) differentiation += 10;
  
  if (evaluateTextDepth(achievement_context) > 60) differentiation += 15;
  if (evaluateTextDepth(underselling_context) > 50) differentiation += 10;

  return {
    direction: Math.min(98, Math.max(25, Math.round(direction))),
    evidence: Math.min(98, Math.max(25, Math.round(evidence))),
    alignment: Math.min(98, Math.max(20, Math.round(alignment))),
    differentiation: Math.min(98, Math.max(25, Math.round(differentiation)))
  };
}
