import React, { useState, useEffect } from 'react';
import { Eye, ExternalLink, Mail, Phone, Calendar, Clock, AlertCircle, FileText, CheckCircle } from 'lucide-react';
import { updateLeadStatus, getSignedDocumentUrl } from '../../services/supabaseService';

export default function LeadDashboard({ leads = [], onRefresh, onClose }) {
  const [selectedLead, setSelectedLead] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [notesInput, setNotesInput] = useState('');
  const [statusInput, setStatusInput] = useState('');
  const [signedResumeUrl, setSignedResumeUrl] = useState(null);
  const [loadingSignedUrl, setLoadingSignedUrl] = useState(false);

  const filteredLeads = leads.filter(lead => {
    if (statusFilter === 'All') return true;
    return lead.status === statusFilter;
  });

  const handleOpenLead = async (lead) => {
    setSelectedLead(lead);
    setNotesInput(lead.internal_notes || '');
    setStatusInput(lead.status || 'New');
    setSignedResumeUrl(null);

    const storagePath = lead.resume_storage_path || (lead.resume_url?.startsWith('diagnostic/') ? lead.resume_url : null);
    if (storagePath) {
      setLoadingSignedUrl(true);
      const url = await getSignedDocumentUrl(storagePath);
      setSignedResumeUrl(url);
      setLoadingSignedUrl(false);
    } else if (lead.resume_url && (lead.resume_url.startsWith('http') || lead.resume_url.startsWith('blob:'))) {
      setSignedResumeUrl(lead.resume_url);
    }
  };

  const handleSaveLeadStatus = async () => {
    if (!selectedLead) return;
    await updateLeadStatus(selectedLead.id, statusInput, notesInput);
    setSelectedLead(prev => ({ ...prev, status: statusInput, internal_notes: notesInput }));
    if (onRefresh) onRefresh();
  };

  return (
    <div className="audit-card" style={{ maxWidth: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '4px' }}>Admin Lead Intelligence Dashboard</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>
            Real-time candidate telemetry, lead qualification scores, and diagnostic snapshots.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {onRefresh && <button className="btn-secondary" onClick={onRefresh}>Refresh Data</button>}
          {onClose && <button className="btn-secondary" onClick={onClose}>Close Admin View</button>}
        </div>
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '4px' }}>
        {['All', 'New', 'Consultation Requested', 'Contacted', 'Consultation Scheduled', 'In Progress', 'Converted', 'Closed'].map(st => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            style={{
              padding: '6px 14px',
              borderRadius: '50px',
              fontSize: '12px',
              fontWeight: 600,
              border: statusFilter === st ? '1px solid var(--color-gold)' : 'var(--border-light)',
              backgroundColor: statusFilter === st ? 'rgba(245,158,11,0.1)' : 'var(--bg-primary)',
              color: statusFilter === st ? 'var(--color-gold)' : 'var(--text-secondary)',
              cursor: 'pointer'
            }}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Main Grid View: Left List, Right Detail */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedLead ? '1fr 1.2fr' : '1fr', gap: '24px' }}>
        
        {/* Table / List */}
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Stage & Target</th>
                <th>Urgency</th>
                <th>Complexity</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                    No diagnostic telemetry submissions found matching filter.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} style={{ backgroundColor: selectedLead?.id === lead.id ? 'rgba(245,158,11,0.05)' : 'transparent' }}>
                    <td>
                      <strong style={{ display: 'block', fontSize: '14px' }}>{lead.name}</strong>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{lead.email}</span>
                    </td>
                    <td>
                      <div style={{ fontSize: '13px', fontWeight: 600 }}>{lead.target_role || 'General Market'}</div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{lead.lead_segment || lead.career_stage || 'N/A'}</span>
                    </td>
                    <td>
                      <span 
                        style={{ 
                          fontSize: '11px', 
                          fontWeight: 700, 
                          padding: '3px 8px', 
                          borderRadius: '4px',
                          backgroundColor: lead.urgency === 'High' ? 'rgba(239,68,68,0.1)' : 'rgba(59,130,246,0.1)',
                          color: lead.urgency === 'High' ? '#ef4444' : '#3B82F6'
                        }}
                      >
                        {lead.urgency || 'Medium'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {lead.diagnostic_complexity || 'Standard'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-gold)' }}>
                        {lead.status || 'New'}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn-secondary" 
                        onClick={() => handleOpenLead(lead)}
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                      >
                        <Eye size={14} /> Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Lead Inspection Drawer */}
        {selectedLead && (
          <div style={{ backgroundColor: 'var(--bg-primary)', border: 'var(--border-glow)', borderRadius: 'var(--radius-md)', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 700 }}>{selectedLead.name}</h3>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{selectedLead.email} • {selectedLead.phone || 'No phone'}</span>
              </div>
              <button onClick={() => setSelectedLead(null)} style={{ color: 'var(--text-muted)', fontSize: '18px', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <div style={{ flex: 1, backgroundColor: 'var(--bg-secondary)', padding: '12px', borderRadius: 'var(--radius-sm)', border: 'var(--border-light)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Target Direction</div>
                <div style={{ fontWeight: 700, fontSize: '13px' }}>{selectedLead.target_role}</div>
              </div>
              <div style={{ flex: 1, backgroundColor: 'var(--bg-secondary)', padding: '12px', borderRadius: 'var(--radius-sm)', border: 'var(--border-light)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Current Signal</div>
                <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--color-gold)' }}>{selectedLead.current_signal || 'Evaluated'}</div>
              </div>
            </div>

            {/* Scores breakdown */}
            <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>Diagnostic Dimension Scores</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px', marginBottom: '20px', textAlign: 'center' }}>
              <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '8px', borderRadius: '4px' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Direction</div>
                <div style={{ fontWeight: 800, color: 'var(--color-gold)' }}>{selectedLead.career_direction_score || 0}%</div>
              </div>
              <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '8px', borderRadius: '4px' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Impact</div>
                <div style={{ fontWeight: 800, color: 'var(--color-gold)' }}>{selectedLead.impact_evidence_score || 0}%</div>
              </div>
              <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '8px', borderRadius: '4px' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Alignment</div>
                <div style={{ fontWeight: 800, color: 'var(--color-gold)' }}>{selectedLead.opportunity_alignment_score || 0}%</div>
              </div>
              <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '8px', borderRadius: '4px' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Diff.</div>
                <div style={{ fontWeight: 800, color: 'var(--color-gold)' }}>{selectedLead.differentiation_score || 0}%</div>
              </div>
            </div>

            {/* Positioning Challenge */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>Primary Positioning Challenge:</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                {selectedLead.primary_opportunity || selectedLead.message || 'No specifics logged.'}
              </p>
            </div>

            {/* Context Answers */}
            {selectedLead.achievement_context && (
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>Undersold Achievement Context:</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{selectedLead.achievement_context}</p>
              </div>
            )}

            {/* Artifact links & Storage info */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
              {loadingSignedUrl ? (
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Generating secure link...</span>
              ) : signedResumeUrl ? (
                <a href={signedResumeUrl} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: 'var(--color-gold)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                  <ExternalLink size={12} /> View Secure Resume (Signed URL)
                </a>
              ) : (selectedLead.resume_url || selectedLead.resume_storage_path) ? (
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <FileText size={12} /> Private Resume Stored ({selectedLead.resume_storage_path || selectedLead.resume_url})
                </span>
              ) : null}

              {selectedLead.linkedin_url && (
                <a href={selectedLead.linkedin_url} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: '#3B82F6', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ExternalLink size={12} /> LinkedIn
                </a>
              )}
            </div>

            {/* Status & Notes Management */}
            <div style={{ borderTop: 'var(--border-light)', paddingTop: '16px' }}>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '12px' }}>Update Candidate Lead Status</label>
                <select className="form-control" value={statusInput} onChange={(e) => setStatusInput(e.target.value)} style={{ fontSize: '13px' }}>
                  <option value="New">New</option>
                  <option value="Consultation Requested">Consultation Requested</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Consultation Scheduled">Consultation Scheduled</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Converted">Converted</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '12px' }}>Internal Strategy Notes</label>
                <textarea 
                  className="form-control" 
                  rows="2" 
                  placeholder="Notes from initial call, target pricing quote, positioning plan..."
                  value={notesInput} 
                  onChange={(e) => setNotesInput(e.target.value)}
                  style={{ fontSize: '13px' }}
                ></textarea>
              </div>

              <button className="btn-primary" onClick={handleSaveLeadStatus} style={{ width: '100%', justifyContent: 'center' }}>
                Save Telemetry & Notes
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
