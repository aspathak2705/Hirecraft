import React, { useState } from 'react';
import { Award, CheckCircle, AlertTriangle, Printer, Mail, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';
import { trackEvent } from '../../utils/analytics';

export default function EvaluationReport({ evaluation, sessionData, onReset }) {
  const [selectedQuestionIdx, setSelectedQuestionIdx] = useState(0);

  const scores = {
    technical: evaluation?.technical_mastery_score || 80,
    impact: evaluation?.impact_articulation_score || 75,
    fit: evaluation?.opportunity_fit_score || 82,
    presence: evaluation?.executive_presence_score || 78
  };

  const handlePrint = () => {
    trackEvent('interview_evaluation_printed');
    window.print();
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }} className="printable-report-area">
      <style>{`
        @media print {
          body { background-color: #ffffff !important; color: #000000 !important; }
          .no-print { display: none !important; }
          .printable-report-area { maxWidth: 100% !important; padding: 0 !important; margin: 0 !important; }
        }
      `}</style>

      {/* Header Banner */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div className="badge no-print" style={{ marginBottom: '12px' }}>
          Phase 5 AI Interview Evaluation
        </div>
        <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '10px' }}>
          Interview Performance & Positioning Report
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
          Personalized evaluation of candidate responses across 10 competency dimensions.
        </p>

        <div className="no-print" style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '16px' }}>
          <button onClick={handlePrint} className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <Printer size={16} /> Print / Export Evaluation Report
          </button>
        </div>
      </div>

      {/* 4 DIMENSION SCORES */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div style={{ backgroundColor: 'var(--bg-secondary)', border: 'var(--border-light)', borderRadius: 'var(--radius-md)', padding: '20px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '6px' }}>Technical Mastery</div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-gold)' }}>{scores.technical}%</div>
          <div className="audit-progress-bar" style={{ marginTop: '8px', height: '4px' }}>
            <div className="audit-progress-fill" style={{ width: `${scores.technical}%` }}></div>
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-secondary)', border: 'var(--border-light)', borderRadius: 'var(--radius-md)', padding: '20px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '6px' }}>Impact Articulation</div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-gold)' }}>{scores.impact}%</div>
          <div className="audit-progress-bar" style={{ marginTop: '8px', height: '4px' }}>
            <div className="audit-progress-fill" style={{ width: `${scores.impact}%` }}></div>
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-secondary)', border: 'var(--border-light)', borderRadius: 'var(--radius-md)', padding: '20px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '6px' }}>Target Opportunity Fit</div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-gold)' }}>{scores.fit}%</div>
          <div className="audit-progress-bar" style={{ marginTop: '8px', height: '4px' }}>
            <div className="audit-progress-fill" style={{ width: `${scores.fit}%` }}></div>
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-secondary)', border: 'var(--border-light)', borderRadius: 'var(--radius-md)', padding: '20px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '6px' }}>Executive Presence</div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-gold)' }}>{scores.presence}%</div>
          <div className="audit-progress-bar" style={{ marginTop: '8px', height: '4px' }}>
            <div className="audit-progress-fill" style={{ width: `${scores.presence}%` }}></div>
          </div>
        </div>
      </div>

      {/* OVERALL SUMMARY */}
      <div style={{ backgroundColor: 'var(--bg-secondary)', border: 'var(--border-glow)', borderRadius: 'var(--radius-lg)', padding: '28px', marginBottom: '32px' }}>
        <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '12px' }}>
          Executive Performance Summary
        </h3>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.7', margin: 0 }}>
          {evaluation?.overall_summary}
        </p>
      </div>

      {/* STRENGTHS & WEAK SIGNALS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
        <div style={{ backgroundColor: 'var(--bg-secondary)', border: 'var(--border-light)', borderRadius: 'var(--radius-md)', padding: '24px' }}>
          <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#10B981', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle size={16} /> Observed Strengths
          </h4>
          <ul style={{ paddingLeft: '18px', margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
            {(evaluation?.strengths || []).map((s, i) => (
              <li key={i} style={{ marginBottom: '8px' }}>{s}</li>
            ))}
          </ul>
        </div>

        <div style={{ backgroundColor: 'var(--bg-secondary)', border: 'var(--border-light)', borderRadius: 'var(--radius-md)', padding: '24px' }}>
          <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#ef4444', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertTriangle size={16} /> Areas for Improvement
          </h4>
          <ul style={{ paddingLeft: '18px', margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
            {(evaluation?.weak_signals || []).map((w, i) => (
              <li key={i} style={{ marginBottom: '8px' }}>{w}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* QUESTION BY QUESTION FEEDBACK ACCORDION */}
      {evaluation?.question_feedback?.length > 0 && (
        <div style={{ backgroundColor: 'var(--bg-secondary)', border: 'var(--border-light)', borderRadius: 'var(--radius-md)', padding: '24px', marginBottom: '32px' }}>
          <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>
            Detailed Question-by-Question Evaluation (10 Questions)
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {evaluation.question_feedback.map((item, idx) => (
              <div key={idx} style={{ backgroundColor: 'var(--bg-primary)', padding: '16px', borderRadius: 'var(--radius-sm)', border: 'var(--border-light)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-gold)' }}>
                    Q{item.question_id || idx + 1}: {item.category}
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-gold)' }}>
                    Score: {item.score}%
                  </span>
                </div>
                <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '8px' }}>"{item.question}"</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '8px' }}>
                  Your Answer: "{item.candidate_answer}"
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-primary)', borderTop: 'var(--border-light)', paddingTop: '8px' }}>
                  <strong>Evaluator Note:</strong> {item.feedback}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CALL TO ACTION */}
      <div className="no-print" style={{ textAlign: 'center', marginTop: '40px' }}>
        <button onClick={onReset} className="btn-secondary">
          Restart Diagnostic / Interview
        </button>
      </div>
    </div>
  );
}
