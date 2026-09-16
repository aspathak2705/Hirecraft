import React from 'react';
import { ArrowLeft, ArrowRight, HelpCircle, Sparkles, CheckCircle } from 'lucide-react';

export default function QuestionCard({
  question,
  currentIndex,
  totalQuestions = 10,
  answerText = '',
  onAnswerChange,
  onNext,
  onPrev,
  onSubmitAll,
  isSubmitting = false
}) {
  const isLastQuestion = currentIndex === totalQuestions - 1;
  const progressPercent = Math.round(((currentIndex + 1) / totalQuestions) * 100);

  return (
    <div style={{ backgroundColor: 'var(--bg-secondary)', border: 'var(--border-glow)', borderRadius: 'var(--radius-lg)', padding: '32px', boxShadow: 'var(--shadow-premium)' }}>
      {/* Top Header & Progress Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-gold)', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Question {currentIndex + 1} of {totalQuestions} • {question.category}
        </span>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Focus: <strong>{question.target_skill}</strong>
        </span>
      </div>

      <div className="audit-progress-bar" style={{ height: '6px', marginBottom: '24px' }}>
        <div className="audit-progress-fill" style={{ width: `${progressPercent}%` }}></div>
      </div>

      {/* Question Text */}
      <h3 style={{ fontSize: '20px', fontWeight: 700, lineHeight: '1.5', color: 'var(--text-primary)', marginBottom: '16px' }}>
        "{question.question_text}"
      </h3>

      {/* Guidance Tip */}
      {question.guidance_tip && (
        <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.06)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: 'var(--radius-sm)', padding: '12px 16px', marginBottom: '20px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          <strong style={{ color: 'var(--color-gold)' }}>💡 Positioning Tip:</strong> {question.guidance_tip}
        </div>
      )}

      {/* Answer Input */}
      <div className="form-group" style={{ marginBottom: '20px' }}>
        <label htmlFor={`answer-${question.id}`} style={{ fontSize: '13px', fontWeight: 600 }}>
          Your Structured Response (Answer using context & metrics):
        </label>
        <textarea
          id={`answer-${question.id}`}
          className="form-control"
          rows="5"
          placeholder="Describe your technical approach, specific tools used, baseline metrics, and final business outcome..."
          value={answerText}
          onChange={(e) => onAnswerChange(e.target.value)}
          style={{ fontSize: '14px', lineHeight: '1.6' }}
        ></textarea>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
          <span>Tip: Highlighting quantitative outcomes improves evaluation score.</span>
          <span>{answerText.length} characters</span>
        </div>
      </div>

      {/* Bottom Navigation Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '28px' }}>
        <button
          type="button"
          className="btn-secondary"
          onClick={onPrev}
          disabled={currentIndex === 0}
          style={{ opacity: currentIndex === 0 ? 0.5 : 1 }}
        >
          <ArrowLeft size={16} /> Previous Question
        </button>

        {!isLastQuestion ? (
          <button type="button" className="btn-primary" onClick={onNext}>
            Next Question <ArrowRight size={16} />
          </button>
        ) : (
          <button
            type="button"
            className="btn-primary"
            onClick={onSubmitAll}
            disabled={isSubmitting}
            style={{ backgroundColor: 'var(--color-gold)', color: '#000000', fontWeight: 800 }}
          >
            {isSubmitting ? 'Evaluating All 10 Answers...' : 'Submit Complete Interview for Evaluation →'}
          </button>
        )}
      </div>
    </div>
  );
}
