/**
 * GrammarPractice — dedicated grammar exercises with explanations.
 * Each topic has a rule card + multiple-choice questions.
 */
import { useState, useCallback } from 'react';
import { GRAMMAR_EXERCISES } from '../core/grammar-exercises';
import { Z_TOOL } from '../core/z-index';
import { playCorrect, playWrong } from '../audio/ui-sfx';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function GrammarPractice({ open, onClose }: Props) {
  const [topicIdx, setTopicIdx] = useState(0);
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState<number | undefined>(undefined);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);

  const topic = GRAMMAR_EXERCISES[topicIdx];
  const question = topic.questions[qIdx];
  const isCorrect = selected === question.correctIdx;

  const selectAnswer = useCallback((idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    setTotal((t) => t + 1);
    if (idx === question.correctIdx) {
      setScore((s) => s + 1);
      playCorrect();
    } else {
      playWrong();
    }
    setShowExplanation(true);
  }, [selected, question.correctIdx]);

  const nextQuestion = useCallback(() => {
    setSelected(undefined);
    setShowExplanation(false);
    if (qIdx < topic.questions.length - 1) {
      setQIdx((i) => i + 1);
    } else if (topicIdx < GRAMMAR_EXERCISES.length - 1) {
      setTopicIdx((i) => i + 1);
      setQIdx(0);
    } else {
      setTopicIdx(0);
      setQIdx(0);
    }
  }, [qIdx, topicIdx, topic.questions.length]);

  const switchTopic = useCallback((idx: number) => {
    setTopicIdx(idx);
    setQIdx(0);
    setSelected(undefined);
    setShowExplanation(false);
  }, []);

  if (!open) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0,
      zIndex: Z_TOOL,
      background: 'rgba(10,9,8,0.94)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Georgia, serif',
    }}>
      <div style={{
        width: '92%', maxWidth: 520, maxHeight: '85vh',
        background: 'linear-gradient(135deg, #1a1816, #221f1c)',
        border: '1px solid #2a2420',
        borderRadius: 8,
        padding: '1.5rem',
        overflowY: 'auto',
      }}>
        <p style={{
          fontSize: '0.65rem', color: '#4a3a2e',
          letterSpacing: '0.15em', margin: '0 0 0.5rem',
          textAlign: 'center',
        }}>
          GRAMMAR PRACTICE &middot; {score}/{total}
        </p>

        {/* Topic tabs */}
        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '0.8rem' }}>
          {GRAMMAR_EXERCISES.map((ex, i) => (
            <button
              key={ex.id}
              onClick={() => switchTopic(i)}
              style={{
                fontFamily: 'Georgia, serif',
                fontSize: '0.68rem',
                padding: '0.25rem 0.5rem',
                background: topicIdx === i ? 'rgba(197,165,90,0.12)' : 'transparent',
                border: `1px solid ${topicIdx === i ? '#c5a55a' : '#2a2420'}`,
                borderRadius: 3,
                color: topicIdx === i ? '#c5a55a' : '#4a3a2e',
                cursor: 'pointer',
              }}
            >
              {ex.icon} {ex.topicZh}
            </button>
          ))}
        </div>

        {/* Rule card */}
        <div style={{
          background: 'rgba(138,175,176,0.06)',
          borderLeft: '3px solid #8aafb0',
          borderRadius: '0 4px 4px 0',
          padding: '0.5rem 0.8rem',
          marginBottom: '0.8rem',
        }}>
          <p style={{ fontSize: '0.65rem', color: '#5a6a6a', letterSpacing: '0.1em', margin: '0 0 0.2rem' }}>
            {topic.icon} {topic.topic}
          </p>
          <p style={{ fontSize: '0.78rem', color: '#8aafb0', margin: '0 0 0.2rem' }}>
            {topic.rule}
          </p>
          <p style={{ fontSize: '0.7rem', color: '#5a6a6a', margin: 0 }}>
            {topic.ruleZh}
          </p>
        </div>

        {/* Question */}
        <p style={{ fontSize: '0.6rem', color: '#4a3a2e', margin: '0 0 0.3rem' }}>
          Question {qIdx + 1}/{topic.questions.length}
        </p>
        <p style={{ fontSize: '0.92rem', color: '#e0d8cc', lineHeight: 1.6, margin: '0 0 0.3rem' }}>
          {question.question}
        </p>
        <p style={{ fontSize: '0.75rem', color: '#6a5a48', margin: '0 0 0.8rem' }}>
          {question.questionZh}
        </p>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.8rem' }}>
          {question.options.map((opt, i) => {
            let bg = 'rgba(197,165,90,0.04)';
            let border = 'rgba(197,165,90,0.15)';
            let color = '#d8ccb4';
            if (selected !== null) {
              if (i === question.correctIdx) {
                bg = 'rgba(100,160,100,0.15)';
                border = 'rgba(100,160,100,0.4)';
                color = '#a0c8a0';
              } else if (i === selected) {
                bg = 'rgba(180,100,100,0.15)';
                border = 'rgba(180,100,100,0.4)';
                color = '#c89090';
              }
            }
            return (
              <button
                key={i}
                onClick={() => selectAnswer(i)}
                disabled={selected !== null}
                style={{
                  fontFamily: 'Georgia, serif',
                  fontSize: '0.85rem',
                  padding: '0.5rem 0.8rem',
                  background: bg,
                  border: `1px solid ${border}`,
                  borderRadius: 6,
                  color,
                  cursor: selected !== null ? 'default' : 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.2s',
                }}
              >
                {String.fromCharCode(65 + i)}. {opt}
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {showExplanation && (
          <div style={{
            background: isCorrect ? 'rgba(100,160,100,0.06)' : 'rgba(180,100,100,0.06)',
            borderLeft: `3px solid ${isCorrect ? '#a0c8a0' : '#c89090'}`,
            borderRadius: '0 4px 4px 0',
            padding: '0.5rem 0.8rem',
            marginBottom: '0.8rem',
          }}>
            <p style={{ fontSize: '0.8rem', color: isCorrect ? '#a0c8a0' : '#c89090', margin: '0 0 0.2rem', fontWeight: 'bold' }}>
              {isCorrect ? '✨ Correct!' : '❌ Incorrect'}
            </p>
            <p style={{ fontSize: '0.78rem', color: '#d8ccb4', margin: '0 0 0.2rem' }}>
              {question.explanation}
            </p>
            <p style={{ fontSize: '0.7rem', color: '#6a5a48', margin: 0 }}>
              {question.explanationZh}
            </p>
          </div>
        )}

        {/* Next / Close */}
        <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center' }}>
          {showExplanation && (
            <button onClick={nextQuestion} style={btnStyle}>
              Next {'→'}
            </button>
          )}
          <button onClick={onClose} style={{ ...btnStyle, color: '#4a3a2e', borderColor: '#2a2420' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  fontFamily: 'Georgia, serif',
  fontSize: '0.82rem',
  padding: '0.5rem 1.4rem',
  background: 'transparent',
  border: '1px solid #3a3228',
  color: '#c5a55a',
  borderRadius: 4,
  cursor: 'pointer',
};
