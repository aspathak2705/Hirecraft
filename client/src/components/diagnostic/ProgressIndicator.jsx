import React from 'react';

export default function ProgressIndicator({ currentStep, totalSteps = 5, stepLabels = [] }) {
  const percentage = Math.round(((currentStep + 1) / totalSteps) * 100);

  return (
    <div style={{ marginBottom: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-gold)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Step 0{currentStep + 1} / 0{totalSteps} — {stepLabels[currentStep] || 'Assessment'}
        </span>
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
          {percentage}% Complete
        </span>
      </div>
      <div className="audit-progress-bar" style={{ height: '8px', backgroundColor: 'var(--bg-tertiary)' }}>
        <div 
          className="audit-progress-fill" 
          style={{ 
            width: `${percentage}%`, 
            backgroundColor: 'var(--color-gold)',
            borderRadius: '4px',
            transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        ></div>
      </div>
    </div>
  );
}
