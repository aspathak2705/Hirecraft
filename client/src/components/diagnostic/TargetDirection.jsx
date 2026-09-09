import React from 'react';

const TIMELINES = [
  'Immediately',
  'Within 1 Month',
  '1–3 Months',
  'Exploring for the Future'
];

export default function TargetDirection({ formData, updateFormData, onNext, onBack }) {
  const isValid = formData.target_role?.trim() && formData.opportunity_timeline;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isValid) onNext();
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>Step 2: Target Direction</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '28px' }}>
        Specify the exact role and timeframe you are aiming for so we can gauge your positioning alignment.
      </p>

      <div className="form-group">
        <label htmlFor="target_role">What specific role are you targeting? *</label>
        <input 
          type="text" 
          id="target_role"
          className="form-control" 
          placeholder="e.g. Senior Software Architect / Product Manager / Marketing Director" 
          value={formData.target_role || ''} 
          onChange={(e) => updateFormData({ target_role: e.target.value })}
          required 
        />
        <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
          Being specific helps evaluate keyword signal strength against real recruiter search filters.
        </span>
      </div>

      <div className="form-group" style={{ marginTop: '24px' }}>
        <label>How soon are you looking to pursue this opportunity? *</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
          {TIMELINES.map((time) => (
            <button
              key={time}
              type="button"
              className={`audit-option ${formData.opportunity_timeline === time ? 'selected' : ''}`}
              onClick={() => updateFormData({ opportunity_timeline: time })}
              style={{ fontSize: '13.5px', padding: '14px' }}
            >
              <div className="audit-radio-circle"></div>
              {time}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '36px' }}>
        <button type="button" className="btn-secondary" onClick={onBack}>
          ← Back
        </button>
        <button 
          type="submit" 
          className="btn-primary" 
          disabled={!isValid}
          style={{ opacity: isValid ? 1 : 0.5 }}
        >
          Continue to Evidence →
        </button>
      </div>
    </form>
  );
}
