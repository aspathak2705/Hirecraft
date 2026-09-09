/**
 * leadQualification.js
 * Rule-based lead classification engine for internal HireCraft lead telemetry
 */

export function qualifyLead(formData, scores) {
  const {
    career_stage,
    opportunity_timeline,
    jd_text,
    jd_url,
    resume_url,
    opportunity_type,
    target_role
  } = formData;

  // 1. Lead Segment
  let lead_segment = 'Growing Professional';
  if (career_stage?.includes('Student') || career_stage?.includes('Fresher')) {
    lead_segment = 'Entry';
  } else if (career_stage?.includes('Experienced')) {
    lead_segment = 'Experienced';
  } else if (career_stage?.includes('Senior') || career_stage?.includes('Leadership')) {
    lead_segment = 'Leadership';
  } else if (opportunity_type?.includes('Transition')) {
    lead_segment = 'Transition';
  }

  // 2. Urgency
  let urgency = 'Medium';
  if (opportunity_timeline === 'Immediately' || opportunity_timeline === 'Within 1 Month') {
    urgency = 'High';
  } else if (opportunity_timeline === 'Exploring for the Future') {
    urgency = 'Low';
  }

  // 3. Diagnostic Complexity
  let diagnostic_complexity = 'Basic';
  const hasJD = !!(jd_text || jd_url);
  const hasResume = !!resume_url;
  
  if (hasJD && hasResume && (lead_segment === 'Leadership' || lead_segment === 'Transition')) {
    diagnostic_complexity = 'Advanced';
  } else if (hasJD || hasResume || lead_segment === 'Experienced') {
    diagnostic_complexity = 'Moderate';
  }

  // 4. Primary Positioning Challenge
  let primary_challenge = 'Experience appears task-driven rather than outcome-focused.';
  if (scores.direction < 55) {
    primary_challenge = 'Broad profile seeking a clear career direction and targeted narrative.';
  } else if (scores.alignment < 50) {
    primary_challenge = `Target role (${target_role || 'Target Role'}) is defined, but evidence supporting alignment needs stronger visibility.`;
  } else if (scores.differentiation < 55) {
    primary_challenge = 'Strong technical foundation, but lacks distinct personal brand differentiation.';
  } else if (scores.evidence < 55) {
    primary_challenge = 'Accomplishments are undersold without clear quantitative metrics or business scale.';
  }

  return {
    lead_segment,
    urgency,
    diagnostic_complexity,
    primary_challenge
  };
}
