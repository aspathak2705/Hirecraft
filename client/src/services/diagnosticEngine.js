/**
 * diagnosticEngine.js
 * Rule-based diagnostic intelligence engine for Phase 1.
 * Pluggable architecture designed to easily swap in LLM/AI backend analysis in future phases.
 */

import { calculatePositioningScores } from '../utils/scoring';
import { qualifyLead } from './leadQualification';

export function runDiagnosticAnalysis(formData) {
  const scores = calculatePositioningScores(formData);
  const qualification = qualifyLead(formData, scores);

  const { target_role, career_stage, opportunity_type } = formData;

  // Generate Current Signal statement
  let currentSignal = 'Potential Not Fully Communicated';
  if (opportunity_type?.includes('Transition')) {
    currentSignal = 'Career Transition in Progress';
  } else if (scores.direction >= 75 && scores.evidence >= 75) {
    currentSignal = 'Emerging Specialist';
  } else if (scores.direction < 55) {
    currentSignal = 'Broad Profile Seeking Clearer Direction';
  } else if (scores.differentiation >= 75) {
    currentSignal = 'Strong Technical Foundation with Room for Narrative Elevation';
  }

  // Generate Positioning Summary
  let positioningSummary = '';
  if (scores.evidence < 60) {
    positioningSummary = `Your profile demonstrates valid experience for ${target_role || 'your target direction'}, but your professional narrative currently presents your work as a list of daily duties rather than evidence of measurable business impact.`;
  } else if (scores.direction < 60) {
    positioningSummary = `Your experience covers a broad spectrum of responsibilities. To attract recruiters for ${target_role || 'target roles'}, your brand must pivot from a generalist summary to a focused value proposition.`;
  } else if (scores.alignment < 60) {
    positioningSummary = `Your background aligns with ${target_role || 'your desired role'}, but key recruiter keywords and target requirements are currently missing from your primary positioning signals.`;
  } else {
    positioningSummary = `Your professional narrative shows strong capability. The primary opportunity is elevating your strategic positioning to command executive presence and premium salary negotiation.`;
  }

  // Primary positioning opportunity
  const primaryOpportunity = qualification.primary_challenge;

  // Investigation Areas (3 locked conversion hooks)
  const investigationAreas = [
    {
      title: "Hidden Achievement Discovery",
      description: "Uncovering quantifiable metric impact behind routine responsibilities that you may be underselling."
    },
    {
      title: `${target_role || 'Target Role'} Narrative Strategy`,
      description: "Structuring your LinkedIn & resume hook to immediately pass recruiter search heuristics within 6 seconds."
    },
    {
      title: "Opportunity-Specific Resume Positioning",
      description: "Framing your experience to match exact business problem statements of high-growth hiring teams."
    }
  ];

  return {
    scores,
    currentSignal,
    positioningSummary,
    primaryOpportunity,
    investigationAreas,
    qualification
  };
}
