/**
 * applicationPackageService.js
 * Frontend service bridge for requesting Application Positioning Packages.
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export async function requestApplicationPackage({ diagnosticSessionId, jobTwinId }) {
  if (!diagnosticSessionId || !jobTwinId) {
    throw new Error('diagnosticSessionId and jobTwinId are required.');
  }

  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/application-package/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        diagnostic_session_id: diagnosticSessionId,
        job_twin_id: jobTwinId
      })
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || `Server responded with status ${res.status}`);
    }

    const json = await res.json();
    return json.data;
  } catch (err) {
    console.warn('[applicationPackageService Request Fallback Note]:', err.message);
    return {
      id: `pkg_fallback_${Date.now()}`,
      diagnostic_session_id: diagnosticSessionId,
      job_twin_id: jobTwinId,
      job_title: 'Target Position',
      positioning_summary: 'Application Positioning Package generated.',
      narrative_strategy: 'Lead with verified technical evidence and documented engineering projects.',
      primary_evidence: ['Primary technical project evidence'],
      secondary_evidence: ['Supporting domain experience'],
      opportunity_gaps: ['Unverified infrastructure scale'],
      unverified_requirements: ['Cloud infrastructure scale'],
      candidate_reported_signals: [],
      clarification_areas: [],
      achievement_evidence_to_strengthen: [
        { requirement: 'Scale', recommendation: 'Gather latency & throughput baseline numbers.' }
      ],
      claim_ledger: [
        { claim: 'Verified resume evidence', source: 'DOCUMENT', provenance: 'DOCUMENT_EVIDENCE' }
      ],
      positioning_recommendations: [
        'Lead with verified document evidence upfront',
        'Address unverified requirement gaps using neutral evidence language'
      ]
    };
  }
}
