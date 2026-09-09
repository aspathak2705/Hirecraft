import React, { useState, useEffect } from 'react';
import { CheckCircle2, Sparkles } from 'lucide-react';

const ANALYSIS_STEPS = [
  'Mapping your professional experience & foundation',
  'Identifying evidence of quantifiable impact & metrics',
  'Evaluating alignment with target role & market direction',
  'Detecting recruiter search positioning gaps',
  'Formulating strategic career positioning snapshot'
];

export default function ProcessingScreen({ onComplete }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < ANALYSIS_STEPS.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setTimeout(onComplete, 800);
          return prev;
        }
      });
    }, 900);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
      <div 
        style={{ 
          width: '64px', 
          height: '64px', 
          margin: '0 auto 24px', 
          borderRadius: '50%',
          backgroundColor: 'var(--color-gold-glow)',
          border: '2px solid var(--color-gold)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'pulse 1.8s infinite ease-in-out'
        }}
      >
        <Sparkles size={32} style={{ color: 'var(--color-gold)' }} />
      </div>

      <h3 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>
        Analyzing Your Professional Narrative...
      </h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '36px' }}>
        Evaluating evidence, direction clarity, and market perception signals.
      </p>

      <div style={{ maxWidth: '440px', margin: '0 auto', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {ANALYSIS_STEPS.map((step, idx) => {
          const isDone = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;

          return (
            <div 
              key={idx} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                opacity: isDone || isCurrent ? 1 : 0.35,
                transition: 'opacity 0.4s ease'
              }}
            >
              <CheckCircle2 
                size={20} 
                style={{ 
                  color: isDone ? 'var(--color-gold)' : isCurrent ? '#3B82F6' : 'var(--text-muted)' 
                }} 
              />
              <span style={{ fontSize: '14px', fontWeight: isCurrent ? 600 : 400 }}>
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
