import React, { useState } from 'react';
import { Lock, ArrowRight, CheckCircle, ShieldAlert } from 'lucide-react';
import { updateSessionConsultation } from '../../services/supabaseService';
import { trackEvent } from '../../utils/analytics';

export default function PositioningReport({ reportData, formData, sessionId, onReset }) {
  const { scores, currentSignal, positioningSummary, primaryOpportunity, investigationAreas } = reportData;

  const [consultationRequested, setConsultationRequested] = useState(false);
  const [preferredContact, setPreferredContact] = useState('Email');
  const [phone, setPhone] = useState(formData.phone || '');
  const [bestTime, setBestTime] = useState('Evening');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div className="badge" style={{ marginBottom: '12px' }}>
          Diagnostic Complete
        </div>
        <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '10px' }}>
          Your Career Positioning Snapshot
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
          Strategic assessment of how your background signals value to hiring decision-makers.
        </p>
      </div>

      {/* 1. CURRENT SIGNAL & SUMMARY */}
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
        <div style={{ fontSize: '12px', color: 'var(--color-gold)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
          Current Recruiter Signal
        </div>
        <h3 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px' }}>
          "{currentSignal}"
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: '1.7' }}>
          {positioningSummary}
        </p>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginTop: '14px', fontStyle: 'italic' }}>
          * Based on the information and materials provided during your assessment.
        </span>
      </div>

      {/* 2. 4 POSITIONING DIMENSIONS */}
      <h4 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>
        Positioning Performance Breakdown
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

      {/* 3. BIGGEST POSITIONING OPPORTUNITY */}
      <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.06)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: 'var(--radius-md)', padding: '24px', marginBottom: '40px' }}>
        <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-gold)', marginBottom: '8px' }}>
          💡 Primary Positioning Opportunity Identified:
        </h4>
        <p style={{ fontSize: '15px', color: 'var(--text-primary)', margin: 0 }}>
          {primaryOpportunity}
        </p>
      </div>

      {/* 4. WHAT WE WOULD INVESTIGATE FURTHER (3 LOCKED HOOKS) */}
      <h4 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>
        What We Would Investigate Further
      </h4>
      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
        Your diagnostic identified key areas where deeper positioning analysis can unlock higher conversion:
      </p>

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

      {/* 5. THE PREMIUM CONVERSION MOMENT */}
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
