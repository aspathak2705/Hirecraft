import React, { useState, useEffect } from 'react';
import QuestionCard from './QuestionCard';
import EvaluationReport from './EvaluationReport';
import { requestInterviewQuestions, submitInterviewAnswers } from '../../services/interviewService';
import { Sparkles, RefreshCw, CheckCircle, ArrowRight } from 'lucide-react';
import { trackEvent } from '../../utils/analytics';

export default function InterviewContainer({ sessionId, onCancel }) {
  const [step, setStep] = useState(0); // 0: Intro, 1: Gen Loading, 2: Q&A Wizard, 3: Eval Loading, 4: Report
  const [interviewSession, setInterviewSession] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [evaluation, setEvaluation] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const startInterview = async () => {
    setStep(1);
    setErrorMessage('');
    trackEvent('interview_started', { sessionId });

    try {
      const sessionRes = await requestInterviewQuestions(sessionId);
      if (sessionRes && sessionRes.questions && sessionRes.questions.length > 0) {
        setInterviewSession(sessionRes);
        setQuestions(sessionRes.questions);
        setAnswers(sessionRes.questions.map(q => ({ question_id: q.id, answer_text: '' })));
        setStep(2);
      } else {
        throw new Error('Failed to generate interview questions.');
      }
    } catch (err) {
      console.warn('Interview question generation note:', err.message);
      setErrorMessage('Could not generate questions right now. Please try again.');
      setStep(0);
    }
  };

  const handleAnswerChange = (val) => {
    const updated = [...answers];
    const currentQId = questions[currentQIdx]?.id || (currentQIdx + 1);
    const existingIdx = updated.findIndex(a => a.question_id === currentQId);
    if (existingIdx >= 0) {
      updated[existingIdx].answer_text = val;
    } else {
      updated.push({ question_id: currentQId, answer_text: val });
    }
    setAnswers(updated);
  };

  const handleNextQuestion = () => {
    if (currentQIdx < questions.length - 1) {
      setCurrentQIdx(currentQIdx + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQIdx > 0) {
      setCurrentQIdx(currentQIdx - 1);
    }
  };

  const handleSubmitAllAnswers = async () => {
    setStep(3);
    trackEvent('interview_submitted', { sessionId });

    try {
      const evalRes = await submitInterviewAnswers(interviewSession?.id, answers);
      if (evalRes) {
        setEvaluation(evalRes);
        setStep(4);
      } else {
        throw new Error('Failed to evaluate interview answers.');
      }
    } catch (err) {
      console.warn('Interview evaluation note:', err.message);
      setErrorMessage('Could not evaluate answers right now. Please try again.');
      setStep(2);
    }
  };

  const currentAnswerText = answers.find(a => a.question_id === (questions[currentQIdx]?.id || (currentQIdx + 1)))?.answer_text || '';

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* STEP 0: INTRO SCREEN */}
      {step === 0 && (
        <div style={{ backgroundColor: 'var(--bg-secondary)', border: 'var(--border-glow)', borderRadius: 'var(--radius-lg)', padding: '40px', textAlign: 'center', boxShadow: 'var(--shadow-premium)' }}>
          <div className="badge" style={{ marginBottom: '12px' }}>
            <Sparkles size={14} /> Phase 5 AI Career Interview Engine
          </div>
          <h2 style={{ fontSize: '30px', fontWeight: 800, marginBottom: '12px' }}>
            Personalized 10-Question Career Interview
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', maxWidth: '650px', margin: '0 auto 28px', lineHeight: '1.6' }}>
            Test your readiness against custom interview questions generated directly from your resume evidence, target role, and job description.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '36px', textAlign: 'left' }}>
            <div style={{ backgroundColor: 'var(--bg-primary)', padding: '16px', borderRadius: 'var(--radius-sm)', border: 'var(--border-light)' }}>
              <strong style={{ fontSize: '13px', color: 'var(--color-gold)', display: 'block', marginBottom: '4px' }}>1. Technical Mastery</strong>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Deep dive into your core tools & architecture.</span>
            </div>
            <div style={{ backgroundColor: 'var(--bg-primary)', padding: '16px', borderRadius: 'var(--radius-sm)', border: 'var(--border-light)' }}>
              <strong style={{ fontSize: '13px', color: 'var(--color-gold)', display: 'block', marginBottom: '4px' }}>2. Impact & Metrics</strong>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Probing measurable business results.</span>
            </div>
            <div style={{ backgroundColor: 'var(--bg-primary)', padding: '16px', borderRadius: 'var(--radius-sm)', border: 'var(--border-light)' }}>
              <strong style={{ fontSize: '13px', color: 'var(--color-gold)', display: 'block', marginBottom: '4px' }}>3. Target JD Fit</strong>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Alignment check against target opportunity.</span>
            </div>
          </div>

          {errorMessage && (
            <div style={{ color: '#f87171', fontSize: '13px', marginBottom: '20px' }}>{errorMessage}</div>
          )}

          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            {onCancel && <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>}
            <button type="button" className="btn-primary" onClick={startInterview} style={{ padding: '14px 28px', fontSize: '15px' }}>
              Start 10-Question AI Interview →
            </button>
          </div>
        </div>
      )}

      {/* STEP 1: QUESTION GENERATION LOADING (LLM CALL #1) */}
      {step === 1 && (
        <div style={{ backgroundColor: 'var(--bg-secondary)', border: 'var(--border-glow)', borderRadius: 'var(--radius-lg)', padding: '60px 40px', textAlign: 'center' }}>
          <RefreshCw size={40} className="spin" style={{ color: 'var(--color-gold)', margin: '0 auto 20px', animation: 'spin 1.5s linear infinite' }} />
          <h3 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '8px' }}>
            Generating Personalized Interview Questions...
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
            Analyzing evidence ledger and target JD requirements (LLM Call #1 of 2)...
          </p>
        </div>
      )}

      {/* STEP 2: QUESTION WIZARD (10 QUESTIONS) */}
      {step === 2 && questions.length > 0 && (
        <QuestionCard
          question={questions[currentQIdx]}
          currentIndex={currentQIdx}
          totalQuestions={questions.length}
          answerText={currentAnswerText}
          onAnswerChange={handleAnswerChange}
          onNext={handleNextQuestion}
          onPrev={handlePrevQuestion}
          onSubmitAll={handleSubmitAllAnswers}
        />
      )}

      {/* STEP 3: ANSWER EVALUATION LOADING (LLM CALL #2) */}
      {step === 3 && (
        <div style={{ backgroundColor: 'var(--bg-secondary)', border: 'var(--border-glow)', borderRadius: 'var(--radius-lg)', padding: '60px 40px', textAlign: 'center' }}>
          <RefreshCw size={40} className="spin" style={{ color: 'var(--color-gold)', margin: '0 auto 20px', animation: 'spin 1.5s linear infinite' }} />
          <h3 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '8px' }}>
            Evaluating All 10 Candidate Responses...
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
            Analyzing technical depth, impact articulation, and executive presence (LLM Call #2 of 2)...
          </p>
        </div>
      )}

      {/* STEP 4: FINAL EVALUATION REPORT */}
      {step === 4 && (
        <EvaluationReport
          evaluation={evaluation}
          onReset={() => { setStep(0); setCurrentQIdx(0); setAnswers([]); }}
        />
      )}
    </div>
  );
}
