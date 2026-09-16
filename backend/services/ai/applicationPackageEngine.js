/**
 * applicationPackageEngine.js
 * Core engine for Phase 7 Application Positioning Package.
 * Deterministically constructs claim ledgers & evidence prioritization from Job Twin,
 * Evidence Items, Career Intelligence, and Interview Intelligence with 0 extra required LLM calls.
 */

import crypto from 'crypto';

function computePackageFingerprint(diagnosticSessionId, jobTwinId) {
  const payload = JSON.stringify({
    diagnosticSessionId,
    jobTwinId,
    packageVersion: 'v1.0'
  });
  return crypto.createHash('sha256').update(payload).digest('hex');
}

/**
 * Generates an evidence-backed Application Positioning Package.
 * Primarily deterministic synthesis of validated Job Twin, Evidence Items, and Interview Intelligence.
 */
export async function generateApplicationPackage({
  supabaseClient,
  diagnosticSessionId,
  jobTwinId,
  jobTwin: providedJobTwin,
  diagnosticSession,
  evidenceLedger,
  interviewSession
}) {
  if (!diagnosticSessionId || (!jobTwinId && !providedJobTwin)) {
    throw new Error('diagnosticSessionId and jobTwinId (or jobTwin object) are required.');
  }

  let jobTwin = providedJobTwin || null;
  let evidenceItems = evidenceLedger || [];
  let interviewRecord = interviewSession || null;
  let sessionRecord = diagnosticSession || null;

  // 1. Fetch DB records if supabaseClient provided
  if (supabaseClient) {
    const [{ data: twinData }, { data: evidenceData }, { data: interviewData }, { data: sessData }] = await Promise.all([
      jobTwinId ? supabaseClient.from('job_twins').select('*').eq('id', jobTwinId).maybeSingle() : Promise.resolve({ data: providedJobTwin }),
      supabaseClient.from('evidence_items').select('*').eq('diagnostic_session_id', diagnosticSessionId),
      supabaseClient.from('interview_sessions').select('*').eq('diagnostic_session_id', diagnosticSessionId).order('created_at', { ascending: false }).limit(1),
      supabaseClient.from('diagnostic_sessions').select('*').eq('id', diagnosticSessionId).maybeSingle()
    ]);

    if (twinData) jobTwin = twinData;
    if (evidenceData) evidenceItems = evidenceData;
    if (interviewData && interviewData.length > 0) interviewRecord = interviewData[0];
    if (sessData) sessionRecord = sessData;
  }

  if (!jobTwin) {
    throw new Error('Target Job Twin not found.');
  }

  // IDOR & Session Ownership Check
  if (jobTwin.diagnostic_session_id && jobTwin.diagnostic_session_id !== diagnosticSessionId) {
    throw new Error('Security Violation: Job Twin does not belong to requested diagnostic session.');
  }

  const fingerprint = computePackageFingerprint(diagnosticSessionId, jobTwin.id || 'twin_active');

  // Check cached package
  if (supabaseClient) {
    const { data: existingPkg } = await supabaseClient
      .from('application_packages')
      .select('*')
      .eq('fingerprint', fingerprint)
      .maybeSingle();

    if (existingPkg) return existingPkg;
  }

  const matrix = jobTwin.evidence_matrix || [];
  const strat = typeof jobTwin.positioning_strategy === 'string'
    ? JSON.parse(jobTwin.positioning_strategy)
    : (jobTwin.positioning_strategy || {});

  // 2. Build Structured Application Claim Ledger with strict Provenance
  const claimLedger = [];

  // Document Evidence Claims
  evidenceItems.forEach(item => {
    claimLedger.push({
      claim: item.source_text,
      source: 'DOCUMENT',
      provenance: 'DOCUMENT_EVIDENCE',
      evidence_reference: item.id || 'doc_ref',
      confidence_type: 'VERIFIED'
    });
  });

  // Candidate Interview Response Claims
  if (interviewRecord && Array.isArray(interviewRecord.answers)) {
    interviewRecord.answers.forEach(a => {
      if (a.answer_text && a.answer_text.trim()) {
        claimLedger.push({
          claim: a.answer_text,
          source: 'INTERVIEW',
          provenance: 'CANDIDATE_INTERVIEW_RESPONSE',
          evidence_reference: `interview_q_${a.question_id}`,
          confidence_type: 'CANDIDATE_REPORTED'
        });
      }
    });
  }

  // Derived Positioning Interpretation Claims
  if (strat.positioning_strategy) {
    claimLedger.push({
      claim: strat.positioning_strategy,
      source: 'SYSTEM_INTERPRETATION',
      provenance: 'DERIVED_INTERPRETATION',
      evidence_reference: 'job_twin_strategy',
      confidence_type: 'STRATEGIC_INTERPRETATION'
    });
  }

  // 3. Construct Achievement Evidence to Strengthen (without fabricating metrics)
  const unverified = matrix.filter(m => m.status === 'NOT_ESTABLISHED').map(m => m.requirement);
  const achievementEvidenceToStrengthen = unverified.map(req => ({
    requirement: req,
    recommendation: `Gather baseline metrics and project scale for ${req} (e.g. system throughput, latency before/after, team size, business impact).`
  }));

  const pkgPayload = {
    diagnostic_session_id: diagnosticSessionId,
    job_twin_id: jobTwin.id || null,
    interview_session_id: interviewRecord?.id || null,
    job_title: jobTwin.job_title || 'Target Opportunity',
    company: jobTwin.company || null,
    package_version: 'v1.0',
    fingerprint,
    positioning_summary: strat.opportunity_summary || `Application Positioning Package for ${jobTwin.job_title}`,
    narrative_strategy: strat.narrative_strategy || `Lead with verified evidence for ${jobTwin.job_title}`,
    primary_evidence: strat.primary_evidence || [],
    secondary_evidence: strat.secondary_evidence || [],
    opportunity_gaps: strat.positioning_gaps || [],
    unverified_requirements: strat.unverified_requirements || unverified,
    candidate_reported_signals: strat.candidate_reported_signals || [],
    clarification_areas: matrix.filter(m => m.status === 'REQUIRES_CLARIFICATION').map(m => m.requirement),
    achievement_evidence_to_strengthen: achievementEvidenceToStrengthen,
    claim_ledger: claimLedger,
    positioning_recommendations: strat.recommended_focus || [
      'Emphasize primary verified document evidence upfront',
      'Frame unverified requirement gaps with neutral evidence language'
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  if (supabaseClient) {
    try {
      const { data: savedPkg, error: saveErr } = await supabaseClient
        .from('application_packages')
        .insert(pkgPayload)
        .select()
        .single();

      if (!saveErr && savedPkg) return savedPkg;
    } catch (e) {
      console.warn('[ApplicationPackage Persistence Note]:', e.message);
    }
  }

  return { id: `pkg_${Date.now()}`, ...pkgPayload };
}
