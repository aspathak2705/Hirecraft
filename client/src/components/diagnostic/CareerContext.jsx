import React from 'react';

export default function CareerContext({ formData, updateFormData, onSubmit, onBack }) {
  return (
    <div>
      <h3 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>Step 5: Career Narrative Context</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
        These strategic insights help us uncover value metrics that traditional resumes often leave behind.
      </p>

      <div className="form-group">
        <label htmlFor="achievement">
          What is one professional achievement you believe does NOT get enough attention in your current profile?
        </label>
        <textarea 
          id="achievement"
          className="form-control" 
          rows="3" 
          placeholder="e.g. Led a key project under tight deadlines that increased team throughput by 30%..."
          value={formData.achievement_context || ''} 
          onChange={(e) => updateFormData({ achievement_context: e.target.value })}
        ></textarea>
      </div>

      <div className="form-group" style={{ marginTop: '20px' }}>
        <label htmlFor="problem_solving">
          What kind of complex problems do people or managers usually rely on you to solve?
        </label>
        <textarea 
          id="problem_solving"
          className="form-control" 
          rows="3" 
          placeholder="e.g. Resolving architectural bottlenecks, turning around failing client accounts, simplifying processes..."
          value={formData.problem_solving_context || ''} 
          onChange={(e) => updateFormData({ problem_solving_context: e.target.value })}
        ></textarea>
      </div>

      <div className="form-group" style={{ marginTop: '20px' }}>
        <label htmlFor="recruiter_memory">
          What is the ONE key takeaway you want recruiters to remember about you?
        </label>
        <textarea 
          id="recruiter_memory"
          className="form-control" 
          rows="2" 
          placeholder="e.g. A data-driven product strategist who bridges engineering and business goals."
          value={formData.recruiter_memory_context || ''} 
          onChange={(e) => updateFormData({ recruiter_memory_context: e.target.value })}
        ></textarea>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '36px' }}>
        <button type="button" className="btn-secondary" onClick={onBack}>
          ← Back
        </button>
        <button type="button" className="btn-primary" onClick={onSubmit}>
          Generate Positioning Snapshot ✨
        </button>
      </div>
    </div>
  );
}
