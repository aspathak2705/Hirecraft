import React, { useState } from 'react';
import ProgressIndicator from './ProgressIndicator';
import CareerSnapshot from './CareerSnapshot';
import TargetDirection from './TargetDirection';
import ProfessionalEvidence from './ProfessionalEvidence';
import TargetOpportunity from './TargetOpportunity';
import CareerContext from './CareerContext';
import ProcessingScreen from './ProcessingScreen';
import PositioningReport from './PositioningReport';
import { runDiagnosticAnalysis } from '../../services/diagnosticEngine';
import { saveDiagnosticSession } from '../../services/supabaseService';
import { trackEvent } from '../../utils/analytics';

const STEP_LABELS = [
  'Career Snapshot',
  'Target Direction',
  'Professional Evidence',
  'Target Opportunity',
  'Career Context'
];

export default function DiagnosticContainer({ onCancel }) {
  const [step, setStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [sessionId, setSessionId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    career_stage: '',
    opportunity_type: '',
    target_role: '',
    opportunity_timeline: '',
    linkedin_url: '',
    portfolio_url: '',
    github_url: '',
    resume_file: null,
    resume_url: null,
    resume_name: null,
    has_jd: false,
    jd_file: null,
    jd_url: null,
    jd_name: null,
    jd_text: '',
    achievement_context: '',
    problem_solving_context: '',
    recruiter_memory_context: '',
    underselling_context: ''
  });

  const updateFormData = (fields) => {
    setFormData((prev) => ({ ...prev, ...fields }));
  };

  const handleNext = () => {
    trackEvent('diagnostic_step_completed', { step: step + 1, label: STEP_LABELS[step] });
    setStep((prev) => Math.min(prev + 1, 4));
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 0));
  };

  const handleFinalSubmit = () => {
    trackEvent('diagnostic_submitted', { target_role: formData.target_role });
    setIsProcessing(true);
  };

  const handleProcessingComplete = async () => {
    const analysis = runDiagnosticAnalysis(formData);
    setReportData(analysis);

    // Save session to Supabase
    const payload = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone || null,
      career_stage: formData.career_stage,
      opportunity_type: formData.opportunity_type,
      target_role: formData.target_role,
      opportunity_timeline: formData.opportunity_timeline,
      linkedin_url: formData.linkedin_url || null,
      portfolio_url: formData.portfolio_url || null,
      github_url: formData.github_url || null,
      resume_url: formData.resume_url || null,
      jd_url: formData.jd_url || null,
      jd_text: formData.jd_text || null,
      achievement_context: formData.achievement_context || null,
      problem_solving_context: formData.problem_solving_context || null,
      recruiter_memory_context: formData.recruiter_memory_context || null,
      underselling_context: formData.underselling_context || null,
      career_direction_score: analysis.scores.direction,
      impact_evidence_score: analysis.scores.evidence,
      opportunity_alignment_score: analysis.scores.alignment,
      differentiation_score: analysis.scores.differentiation,
      current_signal: analysis.currentSignal,
      positioning_summary: analysis.positioningSummary,
      primary_opportunity: analysis.primaryOpportunity,
      lead_segment: analysis.qualification.lead_segment,
      urgency: analysis.qualification.urgency,
      diagnostic_complexity: analysis.qualification.diagnostic_complexity,
      status: 'New'
    };

    const saved = await saveDiagnosticSession(payload);
    if (saved && saved.id) {
      setSessionId(saved.id);
    }

    setIsProcessing(false);
    trackEvent('report_viewed', { score: analysis.scores });
  };

  const handleReset = () => {
    setStep(0);
    setReportData(null);
    setIsProcessing(false);
    setSessionId(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      career_stage: '',
      opportunity_type: '',
      target_role: '',
      opportunity_timeline: '',
      linkedin_url: '',
      portfolio_url: '',
      github_url: '',
      resume_file: null,
      resume_url: null,
      resume_name: null,
      has_jd: false,
      jd_file: null,
      jd_url: null,
      jd_name: null,
      jd_text: '',
      achievement_context: '',
      problem_solving_context: '',
      recruiter_memory_context: '',
      underselling_context: ''
    });
  };

  return (
    <div className="audit-card" style={{ maxWidth: reportData ? '960px' : '720px', margin: '0 auto', transition: 'all 0.3s ease' }}>
      {!isProcessing && !reportData && (
        <>
          <ProgressIndicator currentStep={step} totalSteps={5} stepLabels={STEP_LABELS} />
          {step === 0 && <CareerSnapshot formData={formData} updateFormData={updateFormData} onNext={handleNext} />}
          {step === 1 && <TargetDirection formData={formData} updateFormData={updateFormData} onNext={handleNext} onBack={handleBack} />}
          {step === 2 && <ProfessionalEvidence formData={formData} updateFormData={updateFormData} onNext={handleNext} onBack={handleBack} />}
          {step === 3 && <TargetOpportunity formData={formData} updateFormData={updateFormData} onNext={handleNext} onBack={handleBack} />}
          {step === 4 && <CareerContext formData={formData} updateFormData={updateFormData} onSubmit={handleFinalSubmit} onBack={handleBack} />}
        </>
      )}

      {isProcessing && (
        <ProcessingScreen onComplete={handleProcessingComplete} />
      )}

      {reportData && (
        <PositioningReport 
          reportData={reportData} 
          formData={formData} 
          sessionId={sessionId} 
          onReset={handleReset} 
        />
      )}
    </div>
  );
}
