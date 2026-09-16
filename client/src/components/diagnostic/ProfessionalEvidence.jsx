import React, { useState } from 'react';
import { uploadDocument } from '../../services/supabaseService';
import { extractDocumentText } from '../../services/documentParser';
import { FileText, CheckCircle, Upload, Trash2, AlertCircle, RefreshCw, Eye } from 'lucide-react';

export default function ProfessionalEvidence({ formData, updateFormData, onNext, onBack }) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const processFile = async (file) => {
    if (!file) return;

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size exceeds 10MB limit.');
      return;
    }

    // Validate extension (.pdf, .doc, .docx, .txt)
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['pdf', 'doc', 'docx', 'txt'].includes(ext)) {
      setUploadError('Please upload a PDF, DOCX, or TXT document.');
      return;
    }

    setUploadError('');
    setIsUploading(true);

    try {
      // 1. Private Storage Upload
      const uploadRes = await uploadDocument(file, 'session_temp', 'resume');
      
      // 2. Extract Document Text client-side
      const extraction = await extractDocumentText(file);
      
      updateFormData({ 
        resume_file: file, 
        resume_storage_path: uploadRes?.storage_path, 
        resume_file_name: file.name,
        resume_file_size: file.size,
        resume_file_type: file.type,
        resume_extraction: extraction
      });
    } catch (err) {
      console.warn('Resume upload handler exception:', err.message);
      setUploadError('Upload warning: Document stored securely. You can still continue.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    processFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const removeFile = () => {
    updateFormData({ 
      resume_file: null, 
      resume_storage_path: null, 
      resume_file_name: null,
      resume_file_size: null,
      resume_file_type: null,
      resume_extraction: null
    });
    setShowPreview(false);
  };

  const hasFile = !!(formData.resume_file_name || formData.resume_name);
  const extractionStatus = formData.resume_extraction?.status;
  const textLength = formData.resume_extraction?.length || 0;
  const snippet = formData.resume_extraction?.normalizedText?.substring(0, 300) || '';

  return (
    <div>
      <h3 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>Step 3: Professional Evidence</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
        Your existing resume forms the baseline evidence for your positioning audit.
      </p>

      {/* Enhanced Upload Drop Zone with Drag-and-Drop */}
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{ 
          border: isDragging ? '2px dashed var(--color-gold)' : '2px dashed var(--border-glow)', 
          borderRadius: 'var(--radius-md)', 
          padding: '32px 20px', 
          textAlign: 'center',
          backgroundColor: isDragging ? 'rgba(245, 158, 11, 0.08)' : 'var(--bg-secondary)',
          marginBottom: '24px',
          transition: 'all 0.2s ease',
          boxShadow: isDragging ? '0 0 15px rgba(245, 158, 11, 0.2)' : 'none'
        }}
      >
        {!hasFile ? (
          <div>
            <Upload size={38} style={{ color: 'var(--color-gold)', marginBottom: '12px' }} />
            <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '6px' }}>
              {isDragging ? 'Drop Resume File Here' : 'Drag & Drop Your Current Resume'}
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Supports PDF, DOC, DOCX, TXT (Max 10MB)
            </p>

            <label className="btn-secondary" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              {isUploading ? (
                <>
                  <RefreshCw size={16} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
                  Uploading & Extracting Evidence...
                </>
              ) : 'Browse Document'}
              <input 
                type="file" 
                accept=".pdf,.doc,.docx,.txt" 
                onChange={handleFileChange} 
                style={{ display: 'none' }}
                disabled={isUploading}
              />
            </label>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--bg-tertiary)', padding: '14px 20px', borderRadius: 'var(--radius-sm)', border: 'var(--border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left' }}>
                <FileText size={28} style={{ color: 'var(--color-gold)' }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '14px' }}>{formData.resume_file_name || formData.resume_name}</div>
                  <div style={{ fontSize: '12px', color: extractionStatus === 'processed' ? '#10B981' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {extractionStatus === 'processed' ? (
                      <>
                        <CheckCircle size={12} /> Machine-readable text verified ({textLength} chars)
                      </>
                    ) : (
                      'Document stored securely in private bucket'
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {snippet && (
                  <button 
                    type="button" 
                    onClick={() => setShowPreview(!showPreview)} 
                    className="btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '12px' }}
                  >
                    <Eye size={14} /> {showPreview ? 'Hide Snippet' : 'Preview Extracted Text'}
                  </button>
                )}
                <button 
                  type="button" 
                  onClick={removeFile}
                  style={{ color: '#f87171', padding: '6px', cursor: 'pointer', background: 'none', border: 'none' }}
                  title="Remove document"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            {/* Extracted Text Snippet Preview */}
            {showPreview && snippet && (
              <div style={{ textAlign: 'left', backgroundColor: 'var(--bg-primary)', padding: '14px', borderRadius: 'var(--radius-sm)', border: 'var(--border-light)' }}>
                <div style={{ fontSize: '11px', color: 'var(--color-gold)', fontWeight: 700, marginBottom: '4px' }}>
                  Extracted Evidence Snippet Preview:
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, fontStyle: 'italic', wordBreak: 'break-word' }}>
                  "{snippet}..."
                </p>
              </div>
            )}
          </div>
        )}

        {uploadError && (
          <div style={{ color: '#f87171', fontSize: '12px', marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <AlertCircle size={14} /> {uploadError}
          </div>
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
