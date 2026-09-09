import React, { useState, useEffect } from 'react';
import { Lock, ArrowRight, CheckCircle, ShieldAlert, Sparkles, UserCheck, HelpCircle, FileText, Target, AlertCircle } from 'lucide-react';
import { updateSessionConsultation } from '../../services/supabaseService';
import { fetchCareerIntelligence } from '../../services/careerIntelligenceService';
import { trackEvent } from '../../utils/analytics';

export default function PositioningReport({ reportData, formData, sessionId, onReset }) {
  const { scores, currentSignal, positioningSummary, primaryOpportunity, investigationAreas } = reportData;

  const [intelligence, setIntelligence] = useState(null);
  const [loadingIntelligence, setLoadingIntelligence] = useState(true);

  const [consultationRequested, setConsultationRequested] = useState(false);
  const [preferredContact, setPreferredContact] = useState('Email');
  const [phone, setPhone] = useState(formData.phone || '');
  const [bestTime, setBestTime] = useState('Evening');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadIntelligence() {
      if (sessionId) {
        setLoadingIntelligence(true);
        const data = await fetchCareerIntelligence(sessionId);
        if (data) setIntelligence(data);
        setLoadingIntelligence(false);
      } else {
        setLoadingIntelligence(false);
      }
    }
    loadIntelligence();
  }, [sessionId]);

  const handleConsultationSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    trackEvent('consultation_requested', {
      sessionId,
      targetRole: formData.target_role,
      contactMethod: preferredContact
    });

    await updateSessionConsultation(sessionId, {
      phone,
      preferred_contact: preferredContact,
      best_time: bestTime,
      consultation_notes: notes
    });

    setIsSubmitting(false);
    setConsultationRequested(true);
  };

  const dna = intelligence?.career_dna || {};
  const recruiterPerception = intelligence?.recruiter_perception || {};
  const opportunityAlignment = intelligence?.opportunity_alignment || {};
  const questions = intelligence?.achievement_investigation_questions || [];

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div className="badge" style={{ marginBottom: '12px' }}>
          Phase 3 Grounded Intelligence Active
        </div>
        <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '10px' }}>
          Your Career Positioning Snapshot
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
          Strategic assessment of how your background signals value to hiring decision-makers.
        </p>
      </div>

      {/* 1. CAREER POSITIONING SUMMARY & RECRUITER REALITY MIRROR */}
      <div 
        style={{ 
          backgroundColor: 'var(--bg-secondary)', 
          border: 'var(--border-glow)', 
          borderRadius: 'var(--radius-lg)', 
          padding: '32px', 
          marginBottom: '32px',
          boxShadow: 'var(--shadow-premium)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
          <div style={{ fontSize: '12px', color: 'var(--color-gold)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
            Current Professional Signal (Recruiter Reality Mirror)
          </div>
          {intelligence?.model && (
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', backgroundColor: 'var(--bg-primary)', padding: '4px 8px', borderRadius: '4px', border: 'var(--border-light)' }}>
              Analysis v1.0 • {intelligence.model}
            </span>
          )}
        </div>

        <h3 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px' }}>
          "{intelligence?.current_professional_signal || currentSignal}"
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: '1.7', marginBottom: '16px' }}>
          {intelligence?.positioning_summary || positioningSummary}
        </p>

        {/* Narrative */}
        {intelligence?.career_narrative && (
          <div style={{ backgroundColor: 'var(--bg-primary)', padding: '16px', borderRadius: 'var(--radius-sm)', border: 'var(--border-light)', marginBottom: '14px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-gold)', marginBottom: '4px' }}>Grounded Career Narrative</div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, fontStyle: 'italic' }}>
              "{intelligence.career_narrative}"
            </p>
          </div>
        )}

        <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', fontStyle: 'italic' }}>
          * Based strictly on evidence found in your provided documents and submitted context.
        </span>
      </div>

      {/* 2. CAREER DNA FOUNDATION */}
      {dna?.professional_identity && (
        <div style={{ backgroundColor: 'var(--bg-secondary)', border: 'var(--border-light)', borderRadius: 'var(--radius-md)', padding: '24px', marginBottom: '32px' }}>
          <h4 style={{ fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Sparkles size={18} style={{ color: 'var(--color-gold)' }} /> Career DNA Foundation
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Professional Identity</div>
              <div style={{ fontSize: '14px', fontWeight: 700 }}>{dna.professional_identity}</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Primary Specialization</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-gold)' }}>{dna.primary_positioning}</div>
            </div>
          </div>
        </div>
      )}

      {/* 3. DETERMINISTIC SCORES BREAKDOWN */}
      <h4 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>
        Authoritative Positioning Performance Breakdown
      </h4>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '40px' }}>
        
        <div style={{ backgroundColor: 'var(--bg-secondary)', border: 'var(--border-light)', borderRadius: 'var(--radius-md)', padding: '20px' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '8px' }}>Career Direction Clarity</div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-gold)' }}>{scores.direction}%</div>
          <div className="audit-progress-bar" style={{ marginTop: '8px', height: '5px' }}>
            <div className="audit-progress-fill" style={{ width: `${scores.direction}%` }}></div>
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-secondary)', border: 'var(--border-light)', borderRadius: 'var(--radius-md)', padding: '20px' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '8px' }}>Evidence of Impact</div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-gold)' }}>{scores.evidence}%</div>
          <div className="audit-progress-bar" style={{ marginTop: '8px', height: '5px' }}>
            <div className="audit-progress-fill" style={{ width: `${scores.evidence}%` }}></div>
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-secondary)', border: 'var(--border-light)', borderRadius: 'var(--radius-md)', padding: '20px' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '8px' }}>Opportunity Alignment</div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-gold)' }}>{scores.alignment}%</div>
          <div className="audit-progress-bar" style={{ marginTop: '8px', height: '5px' }}>
            <div className="audit-progress-fill" style={{ width: `${scores.alignment}%` }}></div>
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-secondary)', border: 'var(--border-light)', borderRadius: 'var(--radius-md)', padding: '20px' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '8px' }}>Professional Differentiation</div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-gold)' }}>{scores.differentiation}%</div>
          <div className="audit-progress-bar" style={{ marginTop: '8px', height: '5px' }}>
            <div className="audit-progress-fill" style={{ width: `${scores.differentiation}%` }}></div>
          </div>
        </div>

      </div>

      {/* 4. PRIMARY OPPORTUNITY & GROUNDED STRENGTHS */}
      <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.06)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: 'var(--radius-md)', padding: '24px', marginBottom: '32px' }}>
        <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-gold)', marginBottom: '8px' }}>
          💡 Primary Positioning Opportunity Identified:
        </h4>
        <p style={{ fontSize: '15px', color: 'var(--text-primary)', margin: 0 }}>
          {intelligence?.primary_positioning_opportunity || primaryOpportunity}
        </p>
      </div>

      {/* 5. OPPORTUNITY ALIGNMENT & UNVERIFIED REQUIREMENTS */}
      {opportunityAlignment?.unverified_requirements?.length > 0 && (
        <div style={{ backgroundColor: 'var(--bg-secondary)', border: 'var(--border-light)', borderRadius: 'var(--radius-md)', padding: '24px', marginBottom: '32px' }}>
          <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Target size={18} style={{ color: 'var(--color-gold)' }} /> Target Opportunity Alignment Analysis
          </h4>
          
          {opportunityAlignment.strong_matches?.length > 0 && (
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#10B981', marginBottom: '6px' }}>Explicit Evidence Matches:</div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {opportunityAlignment.strong_matches.map((item, i) => (
                  <span key={i} style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10B981', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>
                    ✓ {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>Unverified Requirements (Not found in provided documents):</div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {opportunityAlignment.unverified_requirements.map((item, i) => (
                <span key={i} style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', color: '#ef4444', padding: '4px 10px', borderRadius: '4px', fontSize: '12px' }}>
                  • {item} (Not established in provided evidence)
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. ACHIEVEMENT MINING (HIDDEN ACHIEVEMENT QUESTIONS) */}
      {questions.length > 0 && (
        <div style={{ backgroundColor: 'var(--bg-secondary)', border: 'var(--border-light)', borderRadius: 'var(--radius-md)', padding: '24px', marginBottom: '40px' }}>
          <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HelpCircle size={18} style={{ color: 'var(--color-gold)' }} /> Hidden Achievement Discovery (Achievement Mining)
          </h4>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            We identified weakly expressed contributions that represent unquantified value. Probing questions:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {questions.map((q, idx) => (
              <div key={idx} style={{ backgroundColor: 'var(--bg-primary)', padding: '14px', borderRadius: 'var(--radius-sm)', border: 'var(--border-light)' }}>
                <strong style={{ fontSize: '13px', color: 'var(--color-gold)', display: 'block', marginBottom: '4px' }}>Area: {q.area}</strong>
                <p style={{ fontSize: '13px', margin: 0, color: 'var(--text-primary)' }}>"{q.question}"</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. WHAT WE WOULD INVESTIGATE FURTHER */}
      <h4 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>
        Strategic Investigation Areas
      </h4>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '48px' }}>
        {investigationAreas.map((area, idx) => (
          <div key={idx} style={{ backgroundColor: 'var(--bg-secondary)', border: 'var(--border-light)', borderRadius: 'var(--radius-md)', padding: '20px', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: 'var(--color-gold)', fontWeight: 700, fontSize: '14px' }}>
              <Lock size={16} /> {area.title}
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
              {area.description}
            </p>
          </div>
        ))}
      </div>

      {/* 8. THE PREMIUM CONVERSION MOMENT */}
      <div 
        style={{ 
          backgroundColor: 'var(--bg-secondary)', 
          border: 'var(--border-glow)', 
          borderRadius: 'var(--radius-lg)', 
          padding: '40px',
          boxShadow: 'var(--shadow-premium)'
        }}
      >
        {!consultationRequested ? (
          <div>
            <h3 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '12px' }}>
              Your career deserves more than a generic rewrite.
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginBottom: '28px', maxWidth: '650px' }}>
              A strong profile starts with understanding the real value behind your experience. Discuss your diagnostic analysis directly with a HireCraft Career Positioning Specialist.
            </p>

            <form onSubmit={handleConsultationSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '500px' }}>
              <div className="form-group">
                <label>Phone / WhatsApp Number (Required for strategy callback) *</label>
                <input 
                  type="tel" 
                  className="form-control" 
                  placeholder="+91 98765 43210" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  required 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Preferred Contact</label>
                  <select className="form-control" value={preferredContact} onChange={(e) => setPreferredContact(e.target.value)}>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Phone Call">Phone Call</option>
                    <option value="Email">Email</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Best Time to Contact</label>
                  <select className="form-control" value={bestTime} onChange={(e) => setBestTime(e.target.value)}>
                    <option value="Morning">Morning (9 AM - 12 PM)</option>
                    <option value="Afternoon">Afternoon (12 PM - 4 PM)</option>
                    <option value="Evening">Evening (4 PM - 8 PM)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Additional Notes / Specific Questions (Optional)</label>
                <textarea 
                  className="form-control" 
                  rows="2" 
                  placeholder="Any specific company or salary goal you are aiming for..."
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)}
                ></textarea>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ flex: 1, justifyContent: 'center' }}>
                  {isSubmitting ? 'Scheduling Request...' : 'Discuss My Career Strategy →'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <CheckCircle size={56} style={{ color: 'var(--color-gold)', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '10px' }}>
              Strategy Session Request Received
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px', maxWidth: '500px', margin: '0 auto 24px' }}>
              Thank you, {formData.name}. Our positioning team is reviewing your assessment inputs and will reach out via {preferredContact} during the {bestTime}.
            </p>
            <button className="btn-secondary" onClick={onReset}>
              Start New Diagnostic
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
