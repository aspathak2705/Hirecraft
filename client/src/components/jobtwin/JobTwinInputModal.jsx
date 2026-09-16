import React, { useState } from 'react';
import { X, Sparkles, Building2, Briefcase, FileText } from 'lucide-react';

export default function JobTwinInputModal({ onSubmit, onClose, isSubmitting }) {
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [jdText, setJdText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!jobTitle.trim() || !jdText.trim()) return;
    onSubmit({ jobTitle: jobTitle.trim(), company: company.trim(), jdText: jdText.trim() });
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(8px)',
      zIndex: 10000,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        border: 'var(--border-glow)',
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '650px',
        width: '100%',
        boxShadow: 'var(--shadow-premium)',
        position: 'relative'
      }}>
        <button 
          onClick={onClose} 
          style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', padding: '10px', borderRadius: '10px', color: 'var(--color-gold)' }}>
            <Sparkles size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>Analyze Target Opportunity</h3>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Create a Job Twin to position your career evidence for a specific role</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Briefcase size={14} style={{ color: 'var(--color-gold)' }} /> Target Job Title *
            </label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="e.g. Senior AI Engineer / Staff Backend Engineer" 
              value={jobTitle} 
              onChange={e => setJobTitle(e.target.value)} 
              required 
            />
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Building2 size={14} style={{ color: 'var(--color-gold)' }} /> Company (Optional)
            </label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="e.g. Anthropic / TechCorp Inc." 
              value={company} 
              onChange={e => setCompany(e.target.value)} 
            />
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileText size={14} style={{ color: 'var(--color-gold)' }} /> Paste Target Job Description *
            </label>
            <textarea 
              className="form-control" 
              rows="6" 
              placeholder="Paste full job description requirements, responsibilities, and qualifications..." 
              value={jdText} 
              onChange={e => setJdText(e.target.value)} 
              required 
            ></textarea>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={isSubmitting || !jobTitle.trim() || !jdText.trim()}
              style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)', border: 'none', fontWeight: 700 }}
            >
              {isSubmitting ? 'Analyzing Opportunity...' : 'Generate Job Twin →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
