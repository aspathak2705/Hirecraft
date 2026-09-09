import React, { useState } from 'react';
import { uploadDocument } from '../../services/supabaseService';
import { FileText, CheckCircle, Upload, Trash2 } from 'lucide-react';

export default function ProfessionalEvidence({ formData, updateFormData, onNext, onBack }) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size (max 8MB)
    if (file.size > 8 * 1024 * 1024) {
      setUploadError('File size exceeds 8MB limit.');
      return;
    }

    // Validate extension
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['pdf', 'doc', 'docx'].includes(ext)) {
      setUploadError('Please upload a PDF or DOCX document.');
      return;
    }

    setUploadError('');
    setIsUploading(true);

    try {
      const fileUrl = await uploadDocument(file, 'resumes');
      updateFormData({ resume_file: file, resume_url: fileUrl, resume_name: file.name });
    } catch (err) {
      setUploadError('Upload failed. You can still continue without uploading.');
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = () => {
    updateFormData({ resume_file: null, resume_url: null, resume_name: null });
  };

  return (
    <div>
      <h3 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>Step 3: Professional Evidence</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
        Your existing resume forms the baseline evidence for your positioning audit.
      </p>

      {/* Upload Drop Zone */}
      <div 
        style={{ 
          border: '2px dashed var(--border-glow)', 
          borderRadius: 'var(--radius-md)', 
          padding: '36px 20px', 
          textAlign: 'center',
          backgroundColor: 'var(--bg-secondary)',
          marginBottom: '24px',
          transition: 'var(--transition)'
        }}
      >
        {!formData.resume_name ? (
          <div>
            <Upload size={36} style={{ color: 'var(--color-gold)', marginBottom: '12px' }} />
            <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '6px' }}>
              Upload Your Current Resume
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Supports PDF, DOC, DOCX (Max 8MB)
            </p>

            <label className="btn-secondary" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              {isUploading ? 'Uploading & Indexing...' : 'Browse Document'}
              <input 
                type="file" 
                accept=".pdf,.doc,.docx" 
                onChange={handleFileChange} 
                style={{ display: 'none' }}
                disabled={isUploading}
              />
            </label>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--bg-tertiary)', padding: '14px 20px', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FileText size={24} style={{ color: 'var(--color-gold)' }} />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 600, fontSize: '14px' }}>{formData.resume_name}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Document indexed securely</div>
              </div>
            </div>
            <button 
              type="button" 
              onClick={removeFile}
              style={{ color: '#f87171', padding: '6px', cursor: 'pointer' }}
              title="Remove document"
            >
              <Trash2 size={18} />
            </button>
          </div>
        )}

        {uploadError && (
          <div style={{ color: '#f87171', fontSize: '12px', marginTop: '12px' }}>{uploadError}</div>
        )}
      </div>

      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '24px', fontStyle: 'italic' }}>
        "Your experience is the foundation of your positioning. We evaluate how clearly your narrative highlights value."
      </p>

      {/* Online Profiles */}
      <h4 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px' }}>Online Presence & Artifacts (Optional)</h4>
      
      <div className="form-group">
        <label htmlFor="linkedin">LinkedIn Profile URL</label>
        <input 
          type="url" 
          id="linkedin"
          className="form-control" 
          placeholder="https://linkedin.com/in/yourprofile" 
          value={formData.linkedin_url || ''} 
          onChange={(e) => updateFormData({ linkedin_url: e.target.value })}
        />
      </div>

      <div className="form-group">
        <label htmlFor="portfolio">Portfolio / Personal Website / GitHub URL</label>
        <input 
          type="url" 
          id="portfolio"
          className="form-control" 
          placeholder="https://github.com/yourhandle or https://yourname.dev" 
          value={formData.portfolio_url || ''} 
          onChange={(e) => updateFormData({ portfolio_url: e.target.value })}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '36px' }}>
        <button type="button" className="btn-secondary" onClick={onBack}>
          ← Back
        </button>
        <button type="button" className="btn-primary" onClick={onNext}>
          Continue to Opportunity Alignment →
        </button>
      </div>
    </div>
  );
}
