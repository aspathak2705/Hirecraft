/**
 * jobTwinEngine.js
 * Core service orchestrator for Phase 6 Application Intelligence Engine (Job Twin).
 * Performs deterministic JD parsing & evidence matrix construction + batched LLM opportunity interpretation.
 */

import crypto from 'crypto';
import { llmProvider } from './llmProvider.js';
import { buildJobTwinPrompt } from './prompts/jobTwinPrompts.js';
import { parseJobDescription } from 'file:///C:/Users/athar/OneDrive/Documents/projects/Hirecraft/client/src/services/jdParser.js';

/**
 * Computes deterministic fingerprint for caching & idempotency.
 */
function computeFingerprint(sessionId, jobTitle, jdText, evidenceItems = [], interviewSession = null) {
  const payload = JSON.stringify({
    sessionId,
    jobTitle: (jobTitle || '').toLowerCase().trim(),
    jdText: (jdText || '').toLowerCase().trim(),
    evidenceCount: evidenceItems.length,
    interviewId: interviewSession?.id || null,
    interviewStatus: interviewSession?.status || null
  });
  return crypto.createHash('sha256').update(payload).digest('hex');
}

/**
 * Deterministically constructs evidence matrix mapping JD requirements to candidate evidence & claims.
 */
export function buildOpportunityEvidenceMatrix(structuredJD, evidenceItems = [], interviewSession = null) {
  const requiredSkills = structuredJD?.required_skills || [];
  const matrix = [];

  const candidateEvidenceMap = new Map();
  evidenceItems.forEach(item => {
    if (item.evidence_type === 'technology') {
      const key = (item.normalized_text || item.source_text || '').toLowerCase().trim();
      if (key) {
        candidateEvidenceMap.set(key, item);
      }
    }
  });

  // Extract candidate interview text for claim detection
  let interviewText = '';
  if (interviewSession && interviewSession.answers && Array.isArray(interviewSession.answers)) {
    interviewText = interviewSession.answers.map(a => a.answer_text || '').join(' ').toLowerCase();
  }

  requiredSkills.forEach(req => {
    const reqLower = req.toLowerCase().trim();
    let status = 'NOT_ESTABLISHED';
    let evidenceRef = null;
    let details = 'Not established in provided document evidence.';

    if (candidateEvidenceMap.has(reqLower)) {
      status = 'SUPPORTED';
      evidenceRef = candidateEvidenceMap.get(reqLower).id || 'doc_evidence';
      details = `Supported by document evidence: "${candidateEvidenceMap.get(reqLower).source_text}"`;
    } else if (interviewText && interviewText.includes(reqLower)) {
      status = 'CANDIDATE_REPORTED';
      details = `Candidate reported experience with ${req} during AI Career Interview.`;
    } else {
      // Check partial/adjacent matches
      const partialMatch = Array.from(candidateEvidenceMap.keys()).find(k => k.includes(reqLower) || reqLower.includes(k));
      if (partialMatch) {
        status = 'PARTIAL';
        evidenceRef = candidateEvidenceMap.get(partialMatch).id;
        details = `Partial evidence found for adjacent skill: "${candidateEvidenceMap.get(partialMatch).source_text}"`;
      }
    }

    matrix.push({
      requirement: req,
      status, // SUPPORTED, PARTIAL, NOT_ESTABLISHED, CANDIDATE_REPORTED, REQUIRES_CLARIFICATION
      evidence_ref: evidenceRef,
      details
    });
  });

  return matrix;
}

/**
 * Generates or retrieves cached Job Twin analysis.
 */
export async function generateJobTwin({
  supabaseClient,
  diagnosticSessionId,
  jobTitle,
  company,
  jdText,
  interviewSessionId,
  diagnosticSession,
  evidenceLedger,
  careerIntelligence,
  interviewSession: providedInterview
}) {
  if (!diagnosticSessionId) {
    throw new Error('diagnosticSessionId is required.');
  }

  let sessionRecord = diagnosticSession || null;
  let evidenceItems = evidenceLedger || [];
  let intelRecord = careerIntelligence || null;
  let interviewRecord = providedInterview || null;

  // 1. Database lookups if client provided
  if (supabaseClient) {
    const [{ data: session }, { data: evidence }, { data: intel }, { data: interview }] = await Promise.all([
      supabaseClient.from('diagnostic_sessions').select('*').eq('id', diagnosticSessionId).maybeSingle(),
      supabaseClient.from('evidence_items').select('*').eq('diagnostic_session_id', diagnosticSessionId),
      supabaseClient.from('career_intelligence').select('*').eq('diagnostic_session_id', diagnosticSessionId).order('created_at', { ascending: false }).limit(1),
      interviewSessionId
        ? supabaseClient.from('interview_sessions').select('*').eq('id', interviewSessionId).maybeSingle()
        : supabaseClient.from('interview_sessions').select('*').eq('diagnostic_session_id', diagnosticSessionId).order('created_at', { ascending: false }).limit(1)
    ]);

    if (session) sessionRecord = session;
    if (evidence) evidenceItems = evidence;
    if (intel && intel.length > 0) intelRecord = intel[0];
    if (interview && interview.data) interviewRecord = interview.data;
  }

  sessionRecord = sessionRecord || { id: diagnosticSessionId, name: 'Candidate', target_role: jobTitle || 'Target Role' };

  // 2. Idempotency Check via Fingerprint
  const fingerprint = computeFingerprint(diagnosticSessionId, jobTitle, jdText, evidenceItems, interviewRecord);

  if (supabaseClient) {
    const { data: existingTwin } = await supabaseClient
      .from('job_twins')
      .select('*')
      .eq('fingerprint', fingerprint)
      .eq('status', 'completed')
      .maybeSingle();

    if (existingTwin) {
      return existingTwin;
    }
  }

  // 3. Deterministic Evidence Matrix
  const structuredJD = parseJobDescription(jdText);
  const evidenceMatrix = buildOpportunityEvidenceMatrix(structuredJD, evidenceItems, interviewRecord);

  // 4. LLM Call #1 (Single batched call for Job Twin)
  const messages = buildJobTwinPrompt({
    candidateSession: sessionRecord,
    evidenceMatrix,
    careerIntelligence: intelRecord,
    interviewIntelligence: interviewRecord?.evaluation,
    jobTitle,
    company,
    jdText
  });

  let rawAnalysis;
  try {
    rawAnalysis = await llmProvider.generateStructuredAnalysis(messages);
  } catch (err) {
    console.warn(`[JobTwin LLM Fallback]: ${err.message}`);
    rawAnalysis = buildDeterministicFallbackJobTwin(sessionRecord, jobTitle, company, evidenceMatrix);
  }

  const normalizedStrategy = validateAndNormalizeJobTwin(rawAnalysis, sessionRecord, jobTitle, evidenceMatrix);

  // 5. Persist Job Twin Record
  const savePayload = {
    diagnostic_session_id: diagnosticSessionId,
    interview_session_id: interviewRecord?.id || null,
    job_title: jobTitle,
    company: company || null,
    jd_text: jdText,
    status: 'completed',
    fingerprint,
    evidence_matrix: evidenceMatrix,
    positioning_strategy: normalizedStrategy,
    narrative_strategy: normalizedStrategy.narrative_strategy,
    updated_at: new Date().toISOString()
  };

  if (supabaseClient) {
    try {
      const { data: savedRecord, error: saveErr } = await supabaseClient
        .from('job_twins')
        .insert(savePayload)
        .select()
        .single();

      if (!saveErr && savedRecord) return savedRecord;
    } catch (e) {
      console.warn('[JobTwin Persistence Note]:', e.message);
    }
  }

  return { id: `twin_${Date.now()}`, ...savePayload };
}

function validateAndNormalizeJobTwin(input, session, jobTitle, matrix) {
  const obj = input || {};
  const supported = matrix.filter(m => m.status === 'SUPPORTED').map(m => m.requirement);
  const partial = matrix.filter(m => m.status === 'PARTIAL').map(m => m.requirement);
  const unverified = matrix.filter(m => m.status === 'NOT_ESTABLISHED').map(m => m.requirement);
  const reported = matrix.filter(m => m.status === 'CANDIDATE_REPORTED').map(m => m.requirement);

  return {
    job_twin_version: obj.job_twin_version || 'v1.0',
    opportunity_summary: typeof obj.opportunity_summary === 'string' ? obj.opportunity_summary : `Target alignment analysis for ${jobTitle || 'Opportunity'}.`,
    positioning_strategy: typeof obj.positioning_strategy === 'string' ? obj.positioning_strategy : `Emphasize candidate's strong document evidence in ${supported.join(', ') || 'core areas'}.`,
    primary_evidence: Array.isArray(obj.primary_evidence) && obj.primary_evidence.length > 0 ? obj.primary_evidence : supported,
    secondary_evidence: Array.isArray(obj.secondary_evidence) ? obj.secondary_evidence : partial,
    partial_matches: Array.isArray(obj.partial_matches) ? obj.partial_matches : partial,
    unverified_requirements: Array.isArray(obj.unverified_requirements) ? obj.unverified_requirements : unverified,
    candidate_reported_signals: Array.isArray(obj.candidate_reported_signals) ? obj.candidate_reported_signals : reported,
    positioning_gaps: Array.isArray(obj.positioning_gaps) ? obj.positioning_gaps : unverified.map(u => `${u} is not established in provided evidence.`),
    narrative_strategy: typeof obj.narrative_strategy === 'string' ? obj.narrative_strategy : `Lead with validated achievements in ${supported.join(', ') || 'technical engineering'}.`,
    recommended_focus: Array.isArray(obj.recommended_focus) ? obj.recommended_focus : ['Highlight verified technical achievements upfront', 'Prepare interview discussion for unverified requirement gaps']
  };
}

function buildDeterministicFallbackJobTwin(session, jobTitle, company, matrix) {
  return validateAndNormalizeJobTwin(null, session, jobTitle, matrix);
}
