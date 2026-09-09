import React from 'react';

const STAGES = [
  'Student / Fresher',
  'Early Career (1-3 yrs)',
  'Growing Professional (3-7 yrs)',
  'Experienced Professional (7-12 yrs)',
  'Senior / Leadership (12+ yrs)',
  'Career Transition'
];

const OPPORTUNITIES = [
  'First Job',
  'Job Switch',
  'Promotion',
  'Career Transition',
  'Leadership Role',
  'Exploring Opportunities'
];

export default function CareerSnapshot({ formData, updateFormData, onNext }) {
  const isValid = formData.name?.trim() && formData.email?.trim() && formData.career_stage && formData.opportunity_type;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isValid) onNext();
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>Step 1: Career Snapshot</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '28px' }}>
        Let's understand where your professional journey stands today so we can evaluate your narrative accurately.
      </p>

      <div className="form-group">
        <label htmlFor="name">Full Name *</label>
        <input 
          type="text" 
          id="name"
          className="form-control" 
          placeholder="e.g. Ananya Sharma" 
          value={formData.name || ''} 
          onChange={(e) => updateFormData({ name: e.target.value })}
          required 
        />
      </div>

      <div className="form-group">
        <label htmlFor="email">Work / Personal Email *</label>
        <input 
          type="email" 
          id="email"
          className="form-control" 
          placeholder="e.g. ananya@example.com" 
          value={formData.email || ''} 
          onChange={(e) => updateFormData({ email: e.target.value })}
          required 
        />
      </div>

      <div className="form-group">
        <label>What best describes your current professional stage? *</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
          {STAGES.map((stage) => (
            <button
              key={stage}
              type="button"
              className={`audit-option ${formData.career_stage === stage ? 'selected' : ''}`}
              onClick={() => updateFormData({ career_stage: stage })}
              style={{ fontSize: '13.5px', padding: '12px 14px' }}
            >
              <div className="audit-radio-circle"></div>
              {stage}
            </button>
          ))}
        </div>
      </div>

      <div className="form-group" style={{ marginTop: '20px' }}>
        <label>What primary opportunity are you preparing for? *</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
          {OPPORTUNITIES.map((opp) => (
            <button
              key={opp}
              type="button"
              className={`audit-option ${formData.opportunity_type === opp ? 'selected' : ''}`}
              onClick={() => updateFormData({ opportunity_type: opp })}
              style={{ fontSize: '13.5px', padding: '12px 14px' }}
            >
              <div className="audit-radio-circle"></div>
              {opp}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px' }}>
        <button 
          type="submit" 
          className="btn-primary" 
          disabled={!isValid}
          style={{ opacity: isValid ? 1 : 0.5 }}
        >
          Continue to Target Direction →
        </button>
      </div>
    </form>
  );
}
