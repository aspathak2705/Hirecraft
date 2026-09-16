/**
 * jobTwinPrompts.js
 * Prompt template for Phase 6 Job Twin Opportunity Positioning Strategy.
 * Enforces strict <UNTRUSTED_DATA> boundaries to prevent prompt injection.
 */

export function buildJobTwinPrompt({
  candidateSession,
  evidenceMatrix,
  careerIntelligence,
  interviewIntelligence,
  jobTitle,
  company,
  jdText
}) {
  const systemPrompt = `You are HireCraft's Application Intelligence Engine (Job Twin).
HireCraft's tagline is "Don't Just Apply. Position Yourself."

Your task: Given a candidate's complete evidence ledger, Career Intelligence, Interview Intelligence, and a target Job Description, produce an evidence-grounded opportunity-specific positioning strategy.

CRITICAL RULES:
1. NEVER invent or fabricate metrics, employers, job titles, responsibilities, or skills.
2. NEVER predict hiring probabilities (e.g. "80% chance of selection").
3. DO NOT mark skills as "matched" if they are not in the provided evidence. Use state "NOT_ESTABLISHED" or "Not established in provided evidence."
4. PRESERVE PROVENANCE: Distinguish between verified DOCUMENT_EVIDENCE and candidate-reported INTERVIEW_CLAIMS. Do NOT silently merge interview claims into verified resume evidence.
5. Do NOT accuse candidates of dishonesty; use neutral evidence language.
6. Return strictly a JSON object conforming to the required schema.

Schema Required:
{
  "job_twin_version": "v1.0",
  "opportunity_summary": "Short summary of the candidate's fit and strategic alignment for this role.",
  "positioning_strategy": "Core strategy on how to frame past experience for this specific role.",
  "primary_evidence": ["Directly relevant document evidence items to emphasize"],
  "secondary_evidence": ["Supporting background evidence items"],
  "partial_matches": ["Skills with partial evidence or adjacent tool experience"],
  "unverified_requirements": ["JD requirements not established in provided evidence"],
  "candidate_reported_signals": ["Claims made in AI interview providing extra context"],
  "positioning_gaps": ["Key positioning gaps and how to address them neutral-evidence style"],
  "narrative_strategy": "The overarching professional story to lead with for this opportunity",
  "recommended_focus": ["Actionable focus areas for the application"]
}`;

  const userContent = `<UNTRUSTED_DATA>
TARGET OPPORTUNITY:
Title: ${jobTitle || 'Target Role'}
Company: ${company || 'Target Employer'}
Job Description:
${jdText || 'Not provided'}

CANDIDATE PROFILE:
Name: ${candidateSession?.name || 'Candidate'}
Target Role: ${candidateSession?.target_role || 'Position'}

CAREER INTELLIGENCE:
Signal: ${careerIntelligence?.current_professional_signal || 'Professional'}
Summary: ${careerIntelligence?.positioning_summary || 'N/A'}

INTERVIEW INTELLIGENCE:
Overall Readiness: ${interviewIntelligence?.overall_readiness_score || 'N/A'}
Performance Tier: ${interviewIntelligence?.performance_tier || 'N/A'}
Interview Strengths: ${JSON.stringify(interviewIntelligence?.key_strengths || [])}

DETERMINISTIC EVIDENCE MATRIX:
${JSON.stringify(evidenceMatrix, null, 2)}
</UNTRUSTED_DATA>`;

  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userContent }
  ];
}
