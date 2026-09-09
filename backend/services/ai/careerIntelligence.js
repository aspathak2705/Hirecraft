/**
 * careerIntelligence.js
 * Career Intelligence Service Orchestrator.
 * Combines Phase 2 Evidence Ledger + Career Context with LLM reasoning via LLMProvider.
 * Includes stale cache invalidation, processing deduplication, and grounded schema validation.
 */

import { llmProvider } from './llmProvider.js';
import { buildPositioningPrompt } from './prompts/positioningAnalysisPrompt.js';

export async function generateCareerIntelligence({
  supabaseClient,
  diagnosticSessionId
}) {
  if (!diagnosticSessionId) {
    throw new Error('diagnosticSessionId is required.');
  }

  // 1. Retrieve session record
  const { data: session, error: sessionErr } = await supabaseClient
    .from('diagnostic_sessions')
    .select('*')
    .eq('id', diagnosticSessionId)
    .maybeSingle();

  if (sessionErr) {
    console.warn(`[CareerIntelligence Session Fetch Note]: ${sessionErr.message}`);
  }

  const sessionRecord = session || {
    id: diagnosticSessionId,
    name: 'Candidate',
    target_role: 'Target Role',
    career_stage: 'Professional',
    urgency: 'Standard'
  };

  // 2. Check existing analysis for caching & idempotency
  const { data: existingAnalysis } = await supabaseClient
    .from('career_intelligence')
    .select('*')
    .eq('diagnostic_session_id', diagnosticSessionId)
    .eq('analysis_version', 'v1.0')
    .order('created_at', { ascending: false })
    .limit(1);

  if (existingAnalysis && existingAnalysis.length > 0) {
    const cached = existingAnalysis[0];
    
    // Idempotency: If already processing, return processing record to prevent duplicate concurrent LLM calls
    if (cached.analysis_status === 'processing') {
      console.log(`[CareerIntelligence Deduplication]: Analysis already processing for session ${diagnosticSessionId}`);
      return cached;
    }

    // Cache freshness check: If session updated after cached analysis created, re-analyze
    const sessionUpdated = sessionRecord.updated_at ? new Date(sessionRecord.updated_at).getTime() : 0;
    const cacheCreated = new Date(cached.created_at).getTime();

    if (cached.analysis_status === 'completed' && sessionUpdated <= cacheCreated) {
      console.log(`[CareerIntelligence Cache Hit]: Returning fresh cached analysis for session ${diagnosticSessionId}`);
      return cached;
    }
  }

  // 3. Fetch structured evidence, sections, and JD
  const [{ data: evidenceItems }, { data: sections }, { data: jobs }] = await Promise.all([
    supabaseClient.from('evidence_items').select('*').eq('diagnostic_session_id', diagnosticSessionId),
    supabaseClient.from('document_sections').select('*'),
    supabaseClient.from('job_opportunities').select('*').eq('diagnostic_session_id', diagnosticSessionId)
  ]);

  const jobOpportunity = jobs && jobs.length > 0 ? jobs[0] : null;

  // 4. Build prompt
  const messages = buildPositioningPrompt({
    candidateSession: sessionRecord,
    evidenceItems: evidenceItems || [],
    documentSections: sections || [],
    jobOpportunity,
    deterministicScores: {
      direction: sessionRecord.career_direction_score || 0,
      evidence: sessionRecord.impact_evidence_score || 0,
      alignment: sessionRecord.opportunity_alignment_score || 0,
      differentiation: sessionRecord.differentiation_score || 0
    }
  });

  // 5. Invoke LLM Provider
  let rawResponse;
  try {
    rawResponse = await llmProvider.generateStructuredAnalysis(messages);
  } catch (err) {
    console.warn(`[CareerIntelligence Fallback Triggered]: ${err.message}`);
    // Fallback to grounded deterministic representation if LLM API is unavailable
    rawResponse = buildDeterministicFallbackIntelligence(sessionRecord, evidenceItems || [], jobOpportunity);
  }

  // 6. Validate & Normalize Output Schema
  const validatedIntelligence = validateAndNormalizeSchema(rawResponse, sessionRecord);

  // 7. Persist to Supabase career_intelligence table
  const savePayload = {
    diagnostic_session_id: diagnosticSessionId,
    model: process.env.OPENROUTER_MODEL || 'nvidia/nemotron-3-super-120b-a12b:free',
    provider: 'openrouter',
    analysis_version: 'v1.0',
    analysis_status: 'completed',
    positioning_summary: validatedIntelligence.positioning_summary,
    current_professional_signal: validatedIntelligence.current_professional_signal,
    target_role_interpretation: validatedIntelligence.target_role_interpretation,
    career_narrative: validatedIntelligence.career_narrative,
    primary_positioning_opportunity: validatedIntelligence.primary_positioning_opportunity,
    strengths: validatedIntelligence.strengths,
    differentiators: validatedIntelligence.differentiators,
    evidence_gaps: validatedIntelligence.evidence_gaps,
    positioning_risks: validatedIntelligence.positioning_risks,
    recruiter_perception: validatedIntelligence.recruiter_perception,
    opportunity_alignment: validatedIntelligence.opportunity_alignment,
    recommendations: validatedIntelligence.recommendations,
    achievement_investigation_questions: validatedIntelligence.achievement_investigation_questions,
    career_dna: validatedIntelligence.career_dna
  };

  try {
    const { data: savedRecord, error: saveErr } = await supabaseClient
      .from('career_intelligence')
      .insert([savePayload])
      .select()
      .maybeSingle();

    if (saveErr) {
      console.warn('[CareerIntelligence Save Note]:', saveErr.message);
      return { id: `ci_${Date.now()}`, ...savePayload };
    }

    return savedRecord || { id: `ci_${Date.now()}`, ...savePayload };
  } catch (e) {
    console.warn('[CareerIntelligence Save Fallback]:', e.message);
    return { id: `ci_${Date.now()}`, ...savePayload };
  }
}

/**
 * Robustly validates and normalizes output schema types.
 */
function validateAndNormalizeSchema(input, session) {
  const obj = input || {};
  return {
    positioning_summary: typeof obj.positioning_summary === 'string' ? obj.positioning_summary : `Profile evaluated for ${session.target_role || 'Target Role'}.`,
    current_professional_signal: typeof obj.current_professional_signal === 'string' ? obj.current_professional_signal : (session.current_signal || 'Emerging Professional'),
    target_role_interpretation: typeof obj.target_role_interpretation === 'string' ? obj.target_role_interpretation : `Positioning towards ${session.target_role || 'Target Role'}.`,
    career_narrative: typeof obj.career_narrative === 'string' ? obj.career_narrative : (session.positioning_summary || 'Narrative grounded in experience evidence.'),
    primary_positioning_opportunity: typeof obj.primary_positioning_opportunity === 'string' ? obj.primary_positioning_opportunity : (session.primary_opportunity || 'Highlight quantitative evidence in core experience.'),
    strengths: Array.isArray(obj.strengths) ? obj.strengths.filter(s => typeof s === 'string') : [],
    differentiators: Array.isArray(obj.differentiators) ? obj.differentiators.filter(d => typeof d === 'string') : [],
    evidence_gaps: Array.isArray(obj.evidence_gaps) ? obj.evidence_gaps.filter(g => typeof g === 'string') : ['Specific metric scale not established in provided evidence.'],
    positioning_risks: Array.isArray(obj.positioning_risks) ? obj.positioning_risks.filter(r => typeof r === 'string') : [],
    recruiter_perception: obj.recruiter_perception && typeof obj.recruiter_perception === 'object' ? {
      positive_signals: Array.isArray(obj.recruiter_perception.positive_signals) ? obj.recruiter_perception.positive_signals : [],
      uncertainties: Array.isArray(obj.recruiter_perception.uncertainties) ? obj.recruiter_perception.uncertainties : ['Requirements unverified in provided materials.'],
      potential_concerns: Array.isArray(obj.recruiter_perception.potential_concerns) ? obj.recruiter_perception.potential_concerns : []
    } : {
      positive_signals: [],
      uncertainties: ['Requirements unverified in provided materials.'],
      potential_concerns: []
    },
    opportunity_alignment: obj.opportunity_alignment && typeof obj.opportunity_alignment === 'object' ? {
      strong_matches: Array.isArray(obj.opportunity_alignment.strong_matches) ? obj.opportunity_alignment.strong_matches : [],
      partial_matches: Array.isArray(obj.opportunity_alignment.partial_matches) ? obj.opportunity_alignment.partial_matches : [],
      unverified_requirements: Array.isArray(obj.opportunity_alignment.unverified_requirements) ? obj.opportunity_alignment.unverified_requirements : ['Not established in provided evidence.']
    } : {
      strong_matches: [],
      partial_matches: [],
      unverified_requirements: ['Not established in provided evidence.']
    },
    recommendations: Array.isArray(obj.recommendations) ? obj.recommendations.filter(r => typeof r === 'string') : [],
    achievement_investigation_questions: Array.isArray(obj.achievement_investigation_questions) ? obj.achievement_investigation_questions.map(q => ({
      area: q.area || 'Impact Metric',
      question: q.question || 'What was the process output before and after your intervention?'
    })) : [
      { area: 'Impact Metric', question: 'What was the process output before and after your intervention?' }
    ],
    career_dna: obj.career_dna && typeof obj.career_dna === 'object' ? {
      professional_identity: typeof obj.career_dna.professional_identity === 'string' ? obj.career_dna.professional_identity : (session.target_role || 'Professional'),
      primary_positioning: typeof obj.career_dna.primary_positioning === 'string' ? obj.career_dna.primary_positioning : (session.current_signal || 'Specialist'),
      core_strengths: Array.isArray(obj.career_dna.core_strengths) ? obj.career_dna.core_strengths : [],
      differentiators: Array.isArray(obj.career_dna.differentiators) ? obj.career_dna.differentiators : []
    } : {
      professional_identity: session.target_role || 'Professional',
      primary_positioning: session.current_signal || 'Specialist',
      core_strengths: [],
      differentiators: []
    }
  };
}

/**
 * Deterministic fallback generator if LLM API is unreachable or missing keys.
 */
function buildDeterministicFallbackIntelligence(session, evidenceItems, jobOpportunity) {
  const techSignals = evidenceItems.filter(e => e.evidence_type === 'technology').map(e => e.source_text);
  const metrics = evidenceItems.filter(e => e.evidence_type === 'quantitative_metric').map(e => e.source_text);

  return {
    positioning_summary: `Candidate profile signals ${session.current_signal || 'evaluated background'} with focus on ${session.target_role || 'Target Role'}.`,
    current_professional_signal: session.current_signal || 'Evaluated Professional',
    target_role_interpretation: `Direct alignment check against ${session.target_role || 'Target Direction'}.`,
    career_narrative: `Background demonstrates technical signals in ${techSignals.slice(0, 4).join(', ') || 'core domains'}. Quantitative metrics detected: ${metrics.length}.`,
    primary_positioning_opportunity: session.primary_opportunity || 'Position core impact achievements upfront.',
    strengths: techSignals.slice(0, 5),
    differentiators: metrics.slice(0, 3),
    evidence_gaps: ['Additional metrics and team scale not established in provided evidence.'],
    positioning_risks: ['Experience details distributed across section bullets.'],
    recruiter_perception: {
      positive_signals: techSignals.slice(0, 3),
      uncertainties: ['Unverified JD requirements in provided documents.'],
      potential_concerns: []
    },
    opportunity_alignment: {
      strong_matches: techSignals.slice(0, 4),
      partial_matches: [],
      unverified_requirements: ['Not established in provided evidence.']
    },
    recommendations: ['Quantify process improvements', 'Highlight core technology signals upfront'],
    achievement_investigation_questions: [
      { area: 'Quantified Output', question: 'What was the exact baseline metric before optimization?' }
    ],
    career_dna: {
      professional_identity: session.target_role || 'Target Specialist',
      primary_positioning: session.current_signal || 'Practitioner',
      core_strengths: techSignals.slice(0, 3),
      differentiators: metrics.slice(0, 2)
    }
  };
}
