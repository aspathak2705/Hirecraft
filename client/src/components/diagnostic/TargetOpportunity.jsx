import React, { useState } from 'react';
import { uploadDocument } from '../../services/supabaseService';
import { FileText, Upload, Trash2 } from 'lucide-react';

export default function TargetOpportunity({ formData, updateFormData, onNext, onBack }) {
  const [hasSpecificJD, setHasSpecificJD] = useState(formData.has_jd || false);
  const [isUploading, setIsUploading] = useState(false);

  const handleJDFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileUrl = await uploadDocument(file, 'job_descriptions');
      updateFormData({ jd_file: file, jd_url: fileUrl, jd_name: file.name });
    } catch (err) {
      console.warn('JD upload failed:', err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <h3 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>Step 4: Target Opportunity</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
        Do you have a specific job description or target opportunity in mind?
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '28px' }}>
        <button
          type="button"
          className={`audit-option ${hasSpecificJD ? 'selected' : ''}`}
          onClick={() => { setHasSpecificJD(true); updateFormData({ has_jd: true }); }}
          style={{ padding: '16px', justifyContent: 'center' }}
        >
          Yes, I have a Job Description
        </button>
        <button
          type="button"
          className={`audit-option ${!hasSpecificJD ? 'selected' : ''}`}
          onClick={() => { setHasSpecificJD(false); updateFormData({ has_jd: false, jd_text: '', jd_name: null }); }}
          style={{ padding: '16px', justifyContent: 'center' }}
        >
          No, I want general market positioning
        </button>
      </div>

      {hasSpecificJD && (
        <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '24px', borderRadius: 'var(--radius-md)', border: 'var(--border-light)', marginBottom: '28px' }}>
          <h4 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px' }}>
            Paste Job Description Text OR Upload Document
          </h4>
          
          <div className="form-group">
            <textarea 
              className="form-control" 
              rows="5" 
              placeholder="Paste job description text here..." 
              value={formData.jd_text || ''} 
              onChange={(e) => updateFormData({ jd_text: e.target.value })}
            ></textarea>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '16px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>OR</span>
            
            {!formData.jd_name ? (
              <label className="btn-secondary" style={{ cursor: 'pointer', fontSize: '13px' }}>
                {isUploading ? 'Uploading JD...' : 'Upload JD File (PDF/DOC)'}
                <input 
                  type="file" 
                  accept=".pdf,.doc,.docx,.txt" 
                  onChange={handleJDFileChange} 
                  style={{ display: 'none' }}
                  disabled={isUploading}
                />
              </label>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--color-gold)' }}>
                <FileText size={16} /> {formData.jd_name}
                <button type="button" onClick={() => updateFormData({ jd_file: null, jd_url: null, jd_name: null })} style={{ color: '#f87171', padding: '2px' }}>
                  <Trash2 size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '24px' }}>
        We compare how your professional story aligns with the opportunity requirements recruiters evaluate.
      </p>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '36px' }}>
        <button type="button" className="btn-secondary" onClick={onBack}>
          ← Back
        </button>
        <button type="button" className="btn-primary" onClick={onNext}>
          Continue to Career Context →
        </button>
      </div>
    </div>
  );
}
