/**
 * DailyChallenge — a rotating vocabulary challenge shown on the title screen.
 * Changes once per day based on the date. Tracks streak.
 */
import { useState, useMemo, useCallback } from 'react';
import { ENGLISH_CHALLENGES } from '../core/english-challenges';
import { ENV_DESCRIPTIONS } from '../core/environment-descriptions';

interface Props {
  onComplete: (correct: boolean) => void;
}

interface DailyData {
  word: string;
  phonetic: string;
  meaning: string;
  sentence: string;
  sentenceZh: string;
  source: string;
}

const DAILY_SAVE_KEY = 'phantom-daily';

function getDayIndex(): number {
  const now = new Date();
  return Math.floor(now.getTime() / 86400000); // days since epoch
}

function getDailyStreak(): { streak: number; lastDay: number; completedToday: boolean } {
  try {
    const raw = localStorage.getItem(DAILY_SAVE_KEY);
    if (raw) {
      const data = JSON.parse(raw) as { streak: number; lastDay: number };
      const today = getDayIndex();
      return {
        streak: data.lastDay === today - 1 ? data.streak : (data.lastDay === today ? data.streak : 0),
        lastDay: data.lastDay,
        completedToday: data.lastDay === today,
      };
    }
  } catch { /* ignore */ }
  return { streak: 0, lastDay: 0, completedToday: false };
}

function saveDailyStreak(streak: number) {
  try {
    localStorage.setItem(DAILY_SAVE_KEY, JSON.stringify({ streak, lastDay: getDayIndex() }));
  } catch { /* ignore */ }
}

function buildMaskedSentence(daily: DailyData): { sentence: string; answer: string } {
  const words = daily.sentence.split(' ');
  const targetIdx = words.findIndex(
    (w) => w.toLowerCase().replace(/[.,!?;:'"]/g, '') === daily.word.toLowerCase()
  );
  if (targetIdx >= 0) {
    const original = words[targetIdx];
    const punct = original.replace(/[a-zA-Z]/g, '');
    words[targetIdx] = '_____' + punct;
    return { sentence: words.join(' '), answer: original.replace(/[.,!?;:'"]/g, '') };
  }
  const longWords = words.filter((w) => w.replace(/[.,!?;:'"]/g, '').length >= 4);
  if (longWords.length > 0) {
    const pick = longWords[getDayIndex() % longWords.length];
    const clean = pick.replace(/[.,!?;:'"]/g, '');
    return { sentence: daily.sentence.replace(pick, '_____'), answer: clean };
  }
  return { sentence: daily.sentence, answer: daily.word };
}

export default function DailyChallenge({ onComplete }: Props) {
  const { streak, completedToday } = useMemo(() => getDailyStreak(), []);
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState<'correct' | 'wrong' | null>(
    completedToday ? 'correct' : null
  );
  const [attempts, setAttempts] = useState(0);

  // Pick today's word deterministically
  const daily = useMemo<DailyData>(() => {
    const allVocab: DailyData[] = [];
    ENGLISH_CHALLENGES.forEach((ch) => {
      ch.vocab.forEach((v) => {
        allVocab.push({
          word: v.word,
          phonetic: v.phonetic,
          meaning: v.meaning,
          sentence: v.example,
          sentenceZh: v.exampleZh,
          source: ch.source,
        });
      });
    });
    // Also add env phrases as daily options
    Object.values(ENV_DESCRIPTIONS).forEach((desc) => {
      allVocab.push({
        word: desc.phrase.split(' ')[0], // first word
        phonetic: '',
        meaning: '',
        sentence: desc.phrase,
        sentenceZh: desc.phraseZh,
        source: 'Environment',
      });
    });

    const idx = getDayIndex() % allVocab.length;
    return allVocab[idx];
  }, []);

  // Create a fill-in question from the sentence
  const maskedSentence = useMemo(() => {
    return buildMaskedSentence(daily);
  }, [daily]);

  const check = useCallback(() => {
    const trimmed = answer.trim().toLowerCase().replace(/[.,!?;:'"]/g, '');
    const correct = maskedSentence.answer.toLowerCase();
    if (trimmed === correct) {
      setResult('correct');
      saveDailyStreak(streak + 1);
      onComplete(true);
    } else {
      setAttempts((a) => a + 1);
      if (attempts >= 2) {
        setResult('wrong');
        saveDailyStreak(0); // reset streak
        onComplete(false);
      }
    }
  }, [answer, maskedSentence, streak, attempts, onComplete]);

  return (
    <div style={{
      width: '90%', maxWidth: 420,
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(100,80,60,0.2)',
      borderRadius: 8,
      padding: '1rem 1.2rem',
      fontFamily: 'Georgia, serif',
      marginTop: '0.8rem',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
        <span style={{ fontSize: '0.6rem', color: '#4a3a2e', letterSpacing: '0.12em' }}>
          DAILY CHALLENGE
        </span>
        {streak > 0 && (
          <span style={{ fontSize: '0.7rem', color: '#c5a55a' }}>
            {'🔥'} {streak} day streak
          </span>
        )}
      </div>

      {completedToday || result === 'correct' ? (
        /* Already completed */
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '0.85rem', color: '#8aafb0', margin: '0 0 0.3rem' }}>
            {'✨'} Today&apos;s word: <strong>{maskedSentence.answer}</strong>
          </p>
          <p style={{ fontSize: '0.75rem', color: '#6a5a48', fontStyle: 'italic', margin: 0 }}>
            Come back tomorrow for a new challenge!
          </p>
        </div>
      ) : result === 'wrong' ? (
        /* Failed */
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '0.85rem', color: '#9a8a78', margin: '0 0 0.3rem' }}>
            The answer was: <strong style={{ color: '#c5a55a' }}>{maskedSentence.answer}</strong>
          </p>
          <p style={{ fontSize: '0.75rem', color: '#6a5a48', fontStyle: 'italic', margin: 0 }}>
            Try again tomorrow!
          </p>
        </div>
      ) : (
        /* Active challenge */
        <>
          <p style={{ fontSize: '0.82rem', color: '#d8ccb4', lineHeight: 1.6, margin: '0 0 0.5rem' }}>
            {maskedSentence.sentence}
          </p>
          {daily.meaning && (
            <p style={{ fontSize: '0.7rem', color: '#6a5a48', margin: '0 0 0.5rem' }}>
              Hint: {daily.meaning}
            </p>
          )}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') check(); }}
              placeholder="Fill in the blank..."
              style={{
                flex: 1,
                fontFamily: 'Georgia, serif',
                fontSize: '0.82rem',
                padding: '0.4rem 0.6rem',
                background: '#0a0908',
                border: '1px solid #3a3228',
                color: '#e0d8cc',
                borderRadius: 4,
                outline: 'none',
              }}
            />
            <button
              onClick={check}
              style={{
                fontFamily: 'Georgia, serif',
                fontSize: '0.78rem',
                padding: '0.4rem 0.8rem',
                background: 'transparent',
                border: '1px solid #4a3a2e',
                color: '#c5a55a',
                borderRadius: 4,
                cursor: 'pointer',
              }}
            >
              Check
            </button>
          </div>
          {attempts > 0 && (
            <p style={{ fontSize: '0.65rem', color: '#8a6a5a', margin: '0.3rem 0 0' }}>
              {3 - attempts} attempt{3 - attempts !== 1 ? 's' : ''} left
            </p>
          )}
        </>
      )}
    </div>
  );
}
