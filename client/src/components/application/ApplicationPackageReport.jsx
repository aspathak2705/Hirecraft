import React, { useState, useEffect } from 'react';
import { Package, ShieldCheck, Printer, Sparkles, FileText, ArrowRight, Award, AlertCircle, Layers, CheckCircle2 } from 'lucide-react';
import { requestApplicationPackage } from '../../services/applicationPackageService';
import { trackEvent } from '../../utils/analytics';

export default function ApplicationPackageReport({ jobTwin, candidateName, onClose }) {
  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPkg() {
      if (!jobTwin) return;
      setLoading(true);
      try {
        const res = await requestApplicationPackage({
          diagnosticSessionId: jobTwin.diagnostic_session_id,
          jobTwinId: jobTwin.id
        });
        setPkg(res);
      } catch (e) {
        console.warn('Package load note:', e.message);
      } finally {
        setLoading(false);
      }
    }
    loadPkg();
  }, [jobTwin]);

  const handlePrint = () => {
    trackEvent('application_package_printed', { jobTitle: jobTwin?.job_title });
    window.print();
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: 'var(--bg-primary)', padding: '40px', borderRadius: '16px', textAlign: 'center' }}>
        <Sparkles size={32} style={{ color: 'var(--color-gold)', animation: 'spin 2s linear infinite', marginBottom: '16px' }} />
        <h3 style={{ fontSize: '20px', fontWeight: 700 }}>Assembling Application Positioning Package...</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Synthesizing validated evidence ledgers & Job Twin intelligence</p>
      </div>
    );
  }

  if (!pkg) return null;

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', padding: '32px', borderRadius: '16px', color: 'var(--text-primary)' }} className="printable-report-area">
      <style>{`
        @media print {
          body { background-color: #ffffff !important; color: #000000 !important; }
          .no-print { display: none !important; }
          .printable-report-area { maxWidth: 100% !important; padding: 0 !important; }
        }
      `}</style>

      {/* Header Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
        <div>
          <div className="badge no-print" style={{ marginBottom: '8px', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', fontWeight: 700 }}>
            Phase 7 • Application Positioning Package
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: 800, margin: 0 }}>
            Application Positioning Package: {pkg.job_title}
          </h2>
          {pkg.company && <span style={{ fontSize: '15px', color: 'var(--color-gold)', fontWeight: 600 }}>{pkg.company}</span>}
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Prepared for <strong>{candidateName || 'Candidate'}</strong>
          </div>
        </div>

        <div className="no-print" style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handlePrint} className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Printer size={16} /> Print / Export PDF
          </button>
          {onClose && (
            <button onClick={onClose} className="btn-secondary">
              Back to Job Twin Report
            </button>
          )}
        </div>
      </div>

      {/* 1. NARRATIVE STRATEGY */}
      <div style={{ backgroundColor: 'var(--bg-secondary)', border: 'var(--border-glow)', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
        <h4 style={{ fontSize: '13px', color: 'var(--color-gold)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, marginBottom: '8px' }}>
          Application Narrative Strategy
        </h4>
        <p style={{ fontSize: '16px', fontWeight: 600, lineHeight: '1.6', margin: 0 }}>
          "{pkg.narrative_strategy}"
        </p>
      </div>

      {/* 2. EVIDENCE PRIORITIZATION MATRIX */}
      <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Award size={18} style={{ color: 'var(--color-gold)' }} /> Evidence Prioritization
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '20px', borderRadius: '12px', border: 'var(--border-light)' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#10B981', marginBottom: '10px' }}>
            ✓ PRIMARY EVIDENCE TO LEAD WITH
          </h4>
          <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            {pkg.primary_evidence?.map((item, i) => <li key={i} style={{ marginBottom: '4px' }}>{item}</li>)}
          </ul>
        </div>

        <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '20px', borderRadius: '12px', border: 'var(--border-light)' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-gold)', marginBottom: '10px' }}>
            • SECONDARY SUPPORTING EVIDENCE
          </h4>
          <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            {pkg.secondary_evidence?.length > 0 ? (
              pkg.secondary_evidence.map((item, i) => <li key={i} style={{ marginBottom: '4px' }}>{item}</li>)
            ) : (
              <li>Adjacent engineering experience</li>
            )}
          </ul>
        </div>
      </div>

      {/* 3. CLAIM PROVENANCE LEDGER */}
      <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <ShieldCheck size={18} style={{ color: '#10B981' }} /> Application Claim Ledger (Provenance Verified)
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px' }}>
        {pkg.claim_ledger?.slice(0, 6).map((c, idx) => (
          <div key={idx} style={{ backgroundColor: 'var(--bg-secondary)', padding: '14px', borderRadius: '8px', border: 'var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 600, display: 'block' }}>"{c.claim}"</span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Ref: {c.evidence_reference}</span>
            </div>
            <span style={{ 
              backgroundColor: c.provenance === 'DOCUMENT_EVIDENCE' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(59, 130, 246, 0.15)',
              color: c.provenance === 'DOCUMENT_EVIDENCE' ? '#10B981' : '#3B82F6',
              padding: '3px 8px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 700
            }}>
              {c.provenance}
            </span>
          </div>
        ))}
      </div>

      {/* 4. ACHIEVEMENT EVIDENCE TO STRENGTHEN */}
      {pkg.achievement_evidence_to_strengthen?.length > 0 && (
        <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '20px', borderRadius: '12px', border: 'var(--border-light)', marginBottom: '32px' }}>
          <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-gold)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={16} /> Evidence Gathering Recommendations
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {pkg.achievement_evidence_to_strengthen.map((item, i) => (
              <div key={i} style={{ backgroundColor: 'var(--bg-primary)', padding: '12px', borderRadius: '6px', border: 'var(--border-light)' }}>
                <strong style={{ fontSize: '13px', color: '#EF4444', display: 'block', marginBottom: '2px' }}>Area: {item.requirement}</strong>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{item.recommendation}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. STRATEGIC POSITIONING RECOMMENDATIONS */}
      {pkg.positioning_recommendations?.length > 0 && (
        <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '20px', borderRadius: '12px', border: 'var(--border-light)' }}>
          <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>
            Application Positioning Recommendations
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {pkg.positioning_recommendations.map((rec, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-primary)' }}>
                <ArrowRight size={14} style={{ color: 'var(--color-gold)', flexShrink: 0 }} />
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
