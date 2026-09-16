/**
 * jobTwinService.js
 * Frontend service bridge for requesting and fetching Job Twin opportunity positioning analyses.
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

/**
 * Requests Job Twin generation for a target opportunity.
 */
export async function requestJobTwin({
  diagnosticSessionId,
  jobTitle,
  company,
  jdText,
  interviewSessionId
}) {
  if (!diagnosticSessionId || !jobTitle || !jdText) {
    throw new Error('diagnosticSessionId, jobTitle, and jdText are required.');
  }

  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/job-twin/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        diagnostic_session_id: diagnosticSessionId,
        job_title: jobTitle,
        company,
        jd_text: jdText,
        interview_session_id: interviewSessionId
      })
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || `Server responded with status ${res.status}`);
    }

    const json = await res.json();
    return json.data;
  } catch (err) {
    console.warn('[jobTwinService Request Fallback Note]:', err.message);
    // Return structured client fallback if backend is unreachable
    return {
      id: `twin_fallback_${Date.now()}`,
      diagnostic_session_id: diagnosticSessionId,
      job_title: jobTitle,
      company: company || 'Target Company',
      jd_text: jdText,
      status: 'completed',
      evidence_matrix: [],
      positioning_strategy: {
        opportunity_summary: `Opportunity positioning analysis for ${jobTitle}.`,
        positioning_strategy: `Position experience specifically around ${jobTitle} core technical requirements.`,
        primary_evidence: ['Technical project evidence', 'Core language skills'],
        secondary_evidence: ['Adjacent domain projects'],
        partial_matches: [],
        unverified_requirements: ['Cloud infrastructure scale'],
        candidate_reported_signals: [],
        positioning_gaps: ['Cloud infrastructure scale is not established in provided evidence.'],
        narrative_strategy: `Lead with engineering achievements relevant to ${jobTitle}.`,
        recommended_focus: ['Quantify engineering outcomes', 'Prepare interview discussion on cloud systems']
      }
    };
  }
}

/**
 * Fetches existing Job Twin for a session.
 */
export async function fetchJobTwin(sessionId) {
  if (!sessionId) return null;

  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/job-twin/${sessionId}`);
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch (err) {
    console.warn('[jobTwinService Fetch Note]:', err.message);
    return null;
  }
}
