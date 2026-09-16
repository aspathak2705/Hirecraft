import React, { useState } from 'react';
import { Target, CheckCircle, ShieldAlert, AlertTriangle, Sparkles, Printer, ArrowRight, Layers, Award, Package } from 'lucide-react';
import { trackEvent } from '../../utils/analytics';
import ApplicationPackageReport from '../application/ApplicationPackageReport';

export default function JobTwinReport({ jobTwin, candidateName, onClose }) {
  const [showPackage, setShowPackage] = useState(false);

  if (!jobTwin) return null;

  if (showPackage) {
    return (
      <ApplicationPackageReport 
        jobTwin={jobTwin} 
        candidateName={candidateName} 
        onClose={() => setShowPackage(false)} 
      />
    );
  }

  const { job_title, company, evidence_matrix = [], positioning_strategy = {} } = jobTwin;
  const strat = typeof positioning_strategy === 'string' ? JSON.parse(positioning_strategy) : positioning_strategy;

  const handlePrint = () => {
    trackEvent('job_twin_printed', { jobTitle: job_title });
    window.print();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'SUPPORTED':
        return <span style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10B981', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700 }}>✓ SUPPORTED</span>;
      case 'PARTIAL':
        return <span style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700 }}>• PARTIAL</span>;
      case 'CANDIDATE_REPORTED':
        return <span style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700 }}>🗣 CANDIDATE REPORTED</span>;
      case 'NOT_ESTABLISHED':
      default:
        return <span style={{ backgroundColor: 'rgba(239, 68, 68, 0.12)', color: '#EF4444', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700 }}>✕ NOT ESTABLISHED IN EVIDENCE</span>;
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', padding: '32px', borderRadius: '16px', color: 'var(--text-primary)' }} className="printable-report-area">
      <style>{`
        @media print {
          body { background-color: #ffffff !important; color: #000000 !important; }
          .no-print { display: none !important; }
          .printable-report-area { maxWidth: 100% !important; padding: 0 !important; }
        }
      `}</style>

      {/* Header & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
        <div>
          <div className="badge no-print" style={{ marginBottom: '8px' }}>
            Phase 6 Application Intelligence • Job Twin
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: 800, margin: 0 }}>
            Opportunity Positioning: {job_title}
          </h2>
          {company && <span style={{ fontSize: '15px', color: 'var(--color-gold)', fontWeight: 600 }}>{company}</span>}
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Grounded positioning strategy for <strong>{candidateName || 'Candidate'}</strong>
          </div>
        </div>

        <div className="no-print" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => setShowPackage(true)} 
            className="btn-primary" 
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', fontWeight: 700 }}
          >
            <Package size={16} /> View Application Positioning Package
          </button>

          <button onClick={handlePrint} className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Printer size={16} /> Print / Download PDF
          </button>
          {onClose && (
            <button onClick={onClose} className="btn-secondary">
              Back to Positioning Report
            </button>
          )}
        </div>
      </div>

      {/* 1. STRATEGIC POSITIONING OVERVIEW */}
      <div style={{ backgroundColor: 'var(--bg-secondary)', border: 'var(--border-glow)', borderRadius: '12px', padding: '24px', marginBottom: '28px', boxShadow: 'var(--shadow-premium)' }}>
        <h4 style={{ fontSize: '14px', color: 'var(--color-gold)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, marginBottom: '8px' }}>
          Core Positioning Strategy
        </h4>
        <p style={{ fontSize: '16px', fontWeight: 600, lineHeight: '1.6', margin: 0 }}>
          "{strat.positioning_strategy}"
        </p>
      </div>

      {/* 2. NARRATIVE ANGLE TO LEAD WITH */}
      {strat.narrative_strategy && (
        <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.06)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '12px', padding: '20px', marginBottom: '28px' }}>
          <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-gold)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} /> Application Narrative Strategy
          </h4>
          <p style={{ fontSize: '14px', color: 'var(--text-primary)', margin: 0, fontStyle: 'italic' }}>
            "{strat.narrative_strategy}"
          </p>
        </div>
      )}

      {/* 3. PROVENANCED OPPORTUNITY EVIDENCE MATRIX */}
      <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Target size={20} style={{ color: 'var(--color-gold)' }} /> Provenanced Evidence Matrix
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '36px' }}>
        {evidence_matrix.length > 0 ? (
          evidence_matrix.map((item, idx) => (
            <div key={idx} style={{ backgroundColor: 'var(--bg-secondary)', padding: '16px', borderRadius: '10px', border: 'var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <strong style={{ fontSize: '15px', color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                  {item.requirement}
                </strong>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {item.details}
                </span>
              </div>
              <div>{getStatusBadge(item.status)}</div>
            </div>
          ))
        ) : (
          <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>No explicit technology signals extracted from job description text.</div>
        )}
      </div>

      {/* 4. PRIMARY & SECONDARY EVIDENCE TO LEAD WITH */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '36px' }}>
        <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '20px', borderRadius: '12px', border: 'var(--border-light)' }}>
          <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#10B981', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={18} /> Primary Evidence to Lead With
          </h4>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: 'var(--text-secondary)' }}>
            {strat.primary_evidence?.length > 0 ? (
              strat.primary_evidence.map((item, i) => <li key={i} style={{ marginBottom: '6px' }}>{item}</li>)
            ) : (
              <li>General technical experience evidence</li>
            )}
          </ul>
        </div>

        <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '20px', borderRadius: '12px', border: 'var(--border-light)' }}>
          <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#EF4444', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={18} /> Positioning Gaps (Neutral Language)
          </h4>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: 'var(--text-secondary)' }}>
            {strat.positioning_gaps?.length > 0 ? (
              strat.positioning_gaps.map((item, i) => <li key={i} style={{ marginBottom: '6px' }}>{item}</li>)
            ) : (
              <li>No major evidence gaps identified</li>
            )}
          </ul>
        </div>
      </div>

      {/* 5. RECOMMENDED ACTIONABLE FOCUS */}
      {strat.recommended_focus?.length > 0 && (
        <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '24px', borderRadius: '12px', border: 'var(--border-light)' }}>
          <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>
            Recommended Application Focus
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {strat.recommended_focus.map((rec, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                <ArrowRight size={16} style={{ color: 'var(--color-gold)', flexShrink: 0 }} />
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
