/**
 * ReviewQuiz — comprehensive timed quiz combining vocabulary, idioms,
 * and reading comprehension from all learned content. Spaced repetition:
 * words the player got wrong appear more frequently.
 */
import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { ENGLISH_CHALLENGES } from '../core/english-challenges';
import { getUnlockedIdioms } from '../core/idioms';
import { useGameStore } from '../core/store';
import { EnglishVocab } from '../core/types';
import { playCorrect, playWrong } from '../audio/ui-sfx';
import { getConfig } from '../core/difficulty';

interface Props {
  open: boolean;
  onClose: () => void;
}

interface QuizQuestion {
  type: 'vocab-meaning' | 'vocab-word' | 'idiom' | 'sentence-fill';
  question: string;
  options: string[];
  correctIdx: number;
  source: string;
}

/** Deterministic shuffle */
function shuffle<T>(arr: T[], seed: number): T[] {
  const result = [...arr];
  let s = seed;
  for (let i = result.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function buildQuestions(
  collectedItems: string[],
  completedChallenges: string[],
  vocabReviewed: Record<string, number>,
): QuizQuestion[] {
  const questions: QuizQuestion[] = [];
  const allVocab: (EnglishVocab & { source: string })[] = [];

  ENGLISH_CHALLENGES
    .filter((ch) => completedChallenges.includes(ch.id))
    .forEach((ch) => {
      ch.vocab.forEach((v) => allVocab.push({ ...v, source: ch.source }));
    });

  if (allVocab.length < 4) return [];

  // Sort by review count (ascending) — spaced repetition: least reviewed first
  const sorted = [...allVocab].sort((a, b) => {
    const ra = vocabReviewed[a.word] || 0;
    const rb = vocabReviewed[b.word] || 0;
    return ra - rb;
  });

  // Generate vocab-meaning questions: "What does X mean?"
  sorted.forEach((v, idx) => {
    const wrongMeanings = allVocab
      .filter((w) => w.word !== v.word)
      .map((w) => w.meaning);
    if (wrongMeanings.length < 3) return;
    const shuffled = shuffle(wrongMeanings, idx * 31 + 7).slice(0, 3);
    const correctIdx = (idx * 17 + 3) % 4;
    const options = [...shuffled];
    options.splice(correctIdx, 0, v.meaning);
    questions.push({
      type: 'vocab-meaning',
      question: `What does "${v.word}" mean?`,
      options,
      correctIdx,
      source: v.source,
    });
  });

  // Generate vocab-word questions: "Which word means X?"
  sorted.slice(0, 8).forEach((v, idx) => {
    const wrongWords = allVocab
      .filter((w) => w.word !== v.word)
      .map((w) => w.word);
    if (wrongWords.length < 3) return;
    const shuffled = shuffle(wrongWords, idx * 41 + 11).slice(0, 3);
    const correctIdx = (idx * 13 + 2) % 4;
    const options = [...shuffled];
    options.splice(correctIdx, 0, v.word);
    questions.push({
      type: 'vocab-word',
      question: `Which word means "${v.meaning}"?`,
      options,
      correctIdx,
      source: v.source,
    });
  });

  // Idiom questions
  const idioms = getUnlockedIdioms(collectedItems);
  idioms.forEach((idiom, idx) => {
    const wrongMeanings = idioms
      .filter((i) => i.id !== idiom.id)
      .map((i) => i.meaning);
    if (wrongMeanings.length < 2) return;
    const shuffled = shuffle(wrongMeanings, idx * 53 + 17).slice(0, 3);
    while (shuffled.length < 3) shuffled.push('To do something unexpected');
    const correctIdx = (idx * 19 + 1) % 4;
    const options = [...shuffled];
    options.splice(correctIdx, 0, idiom.meaning);
    questions.push({
      type: 'idiom',
      question: `"${idiom.idiom}" means:`,
      options,
      correctIdx,
      source: 'Idiom',
    });
  });

  return shuffle(questions, Date.now() % 10000);
}

export default function ReviewQuiz({ open, onClose }: Props) {
  const collectedItems = useGameStore((s) => s.collectedItems);
  const learning = useGameStore((s) => s.learning);
  const reviewVocab = useGameStore((s) => s.reviewVocab);

  const questions = useMemo(
    () => buildQuestions(collectedItems, learning.completedChallenges, learning.vocabReviewed),
    [collectedItems, learning.completedChallenges, learning.vocabReviewed]
  );

  const [qIdx, setQIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const diffConfig = getConfig();
  const [timeLeft, setTimeLeft] = useState(diffConfig.quizTime);
  const [gameOver, setGameOver] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const current = questions[qIdx % Math.max(questions.length, 1)];

  // Timer
  useEffect(() => {
    if (!open || gameOver || questions.length === 0) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { setGameOver(true); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [open, gameOver, questions.length]);

  const selectOption = useCallback((idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    setTotal((t) => t + 1);
    const isCorrect = idx === current.correctIdx;
    if (isCorrect) { setScore((s) => s + 1); playCorrect(); }
    else { playWrong(); }

    // Track review for spaced repetition
    if (current.type === 'vocab-meaning' || current.type === 'vocab-word') {
      const word = current.question.match(/"([^"]+)"/)?.[1];
      if (word) reviewVocab(word);
    }

    // Auto advance after 1s
    setTimeout(() => {
      setSelected(null);
      if (qIdx >= questions.length - 1) {
        setGameOver(true);
      } else {
        setQIdx((i) => i + 1);
      }
    }, 1000);
  }, [selected, current, qIdx, questions.length, reviewVocab]);

  const restart = useCallback(() => {
    setQIdx(0);
    setScore(0);
    setTotal(0);
    setSelected(null);
    setTimeLeft(diffConfig.quizTime);
    setGameOver(false);
  }, []);

  if (!open) return null;

  if (questions.length < 4) {
    return (
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(10,9,8,0.92)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 210, cursor: 'pointer', fontFamily: 'Georgia, serif',
      }}>
        <div style={{ color: '#6a5a48', fontSize: '0.95rem', textAlign: 'center' }}>
          <p style={{ fontSize: '2rem', margin: '0 0 0.5rem' }}>{'🏆'}</p>
          <p>Need more vocabulary to start a quiz!</p>
          <p style={{ fontSize: '0.78rem', color: '#4a3a2e' }}>
            Complete more challenges to unlock Review Quiz.
          </p>
        </div>
      </div>
    );
  }

  const btnBase: React.CSSProperties = {
    fontFamily: 'Georgia, serif', fontSize: '0.82rem',
    padding: '0.5rem 1.4rem', background: 'transparent',
    border: '1px solid #3a3228', color: '#c5a55a',
    borderRadius: 4, cursor: 'pointer',
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(10,9,8,0.94)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      zIndex: 210, fontFamily: 'Georgia, serif',
    }}>
      {gameOver ? (
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '2rem', margin: '0 0 0.5rem' }}>
            {score >= total * 0.8 ? '🏆' : score >= total * 0.5 ? '⭐' : '📚'}
          </p>
          <p style={{ fontSize: '1.3rem', color: '#c5a55a', margin: '0 0 0.3rem' }}>
            {score} / {total}
          </p>
          <p style={{ fontSize: '0.85rem', color: '#9a8a78', margin: '0 0 0.3rem' }}>
            {score >= total * 0.8 ? 'Outstanding!' : score >= total * 0.5 ? 'Good job!' : 'Keep studying!'}
          </p>
          <p style={{ fontSize: '0.72rem', color: '#6a5a48', margin: '0 0 1.2rem' }}>
            {Math.round((score / Math.max(total, 1)) * 100)}% accuracy
          </p>
          <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center' }}>
            <button onClick={restart} style={btnBase}>Try Again</button>
            <button onClick={onClose} style={{ ...btnBase, color: '#6a5a48' }}>Close</button>
          </div>
        </div>
      ) : (
        <>
          {/* Header */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            width: '90%', maxWidth: 460, marginBottom: '1rem',
          }}>
            <span style={{ fontSize: '0.7rem', color: '#6a5a48', letterSpacing: '0.12em' }}>
              REVIEW QUIZ ({qIdx + 1}/{questions.length})
            </span>
            <span style={{
              fontSize: '0.85rem', fontWeight: 'bold',
              color: timeLeft <= 10 ? '#c87a6a' : '#c5a55a',
            }}>
              {timeLeft}s
            </span>
          </div>

          {/* Score */}
          <p style={{ fontSize: '0.72rem', color: '#8aafb0', margin: '0 0 0.8rem' }}>
            Score: {score}/{total}
          </p>

          {/* Question */}
          <div style={{
            width: '90%', maxWidth: 460,
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid #2a2420',
            borderRadius: 8,
            padding: '1.2rem',
            marginBottom: '0.8rem',
          }}>
            <p style={{ fontSize: '0.6rem', color: '#4a3a2e', letterSpacing: '0.1em', margin: '0 0 0.4rem' }}>
              {current.type === 'vocab-meaning' ? 'VOCABULARY' :
               current.type === 'vocab-word' ? 'REVERSE VOCAB' :
               current.type === 'idiom' ? 'IDIOM' : 'SENTENCE'}
            </p>
            <p style={{ fontSize: '0.95rem', color: '#e0d8cc', lineHeight: 1.6, margin: 0 }}>
              {current.question}
            </p>
          </div>

          {/* Options */}
          <div style={{
            width: '90%', maxWidth: 460,
            display: 'flex', flexDirection: 'column', gap: '0.4rem',
          }}>
            {current.options.map((opt, i) => {
              let bg = 'rgba(197,165,90,0.04)';
              let border = 'rgba(197,165,90,0.15)';
              let color = '#d8ccb4';
              if (selected !== null) {
                if (i === current.correctIdx) {
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
                  onClick={() => selectOption(i)}
                  disabled={selected !== null}
                  style={{
                    fontFamily: 'Georgia, serif',
                    fontSize: '0.85rem',
                    padding: '0.6rem 1rem',
                    background: bg,
                    border: `1px solid ${border}`,
                    borderRadius: 6,
                    color,
                    cursor: selected !== null ? 'default' : 'pointer',
                    textAlign: 'left',
                    transition: 'background 0.2s, border-color 0.2s',
                  }}
                >
                  {String.fromCharCode(65 + i)}. {opt}
                </button>
              );
            })}
          </div>

          <button
            onClick={onClose}
            style={{ ...btnBase, color: '#3a3228', borderColor: '#2a2420', marginTop: '1rem' }}
          >
            Quit
          </button>
        </>
      )}
    </div>
  );
}
