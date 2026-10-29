import { Z_TOOL } from '../core/z-index';
/**
 * WritingJournal — creative English writing prompts based on the Phantom story.
 * Entries are saved in localStorage. Encourages free-form English practice.
 */
import { useState, useMemo, useCallback } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
}

interface WritingPrompt {
  id: string;
  prompt: string;
  promptZh: string;
  hint: string;
  category: 'creative' | 'opinion' | 'description' | 'letter';
}

const PROMPTS: WritingPrompt[] = [
  {
    id: 'wp-1',
    prompt: 'Write a letter from the Phantom to Christine, explaining why he hid underground.',
    promptZh: '以魅影的身份给克里斯汀写一封信，解释他为什么藏在地下。',
    hint: 'Start with "Dear Christine," and use words like: beneath, solitude, music, darkness, fear',
    category: 'letter',
  },
  {
    id: 'wp-2',
    prompt: 'Describe the underground lake in 5 sentences. What does it look, sound, and feel like?',
    promptZh: '用五句英语描述地下湖。它看起来、听起来、感觉起来怎么样？',
    hint: 'Use senses: sight (candlelight, reflections), sound (echoes, water), touch (cold, damp)',
    category: 'description',
  },
  {
    id: 'wp-3',
    prompt: 'Do you think the Phantom is a villain or a victim? Explain your opinion in English.',
    promptZh: '你认为魅影是反派还是受害者？用英语解释你的观点。',
    hint: 'Use: "I believe...", "On one hand... on the other hand...", "In my opinion..."',
    category: 'opinion',
  },
  {
    id: 'wp-4',
    prompt: 'Imagine you are Christine. Write in your diary after the first time you heard the Phantom\'s voice.',
    promptZh: '假设你是克里斯汀。在第一次听到魅影的声音后写日记。',
    hint: 'Start with "Dear Diary," and express emotions: amazement, fear, curiosity, wonder',
    category: 'creative',
  },
  {
    id: 'wp-5',
    prompt: 'Describe the moment the mask falls off. What does Christine see? How does she feel?',
    promptZh: '描述面具落下的那一刻。克里斯汀看到了什么？她有什么感觉？',
    hint: 'Use contrast: beautiful voice vs disfigured face, fear vs compassion',
    category: 'description',
  },
  {
    id: 'wp-6',
    prompt: 'Write a new ending for the story. What happens after the Phantom disappears?',
    promptZh: '为故事写一个新结局。魅影消失后发生了什么？',
    hint: 'Think about: where does he go? Does he find peace? Does Christine ever return?',
    category: 'creative',
  },
];

const SAVE_KEY = 'phantom-writing-journal';

function loadEntries(): Record<string, string> {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? JSON.parse(raw) as Record<string, string> : {};
  } catch { return {}; }
}

function saveEntries(entries: Record<string, string>) {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(entries)); } catch { /* */ }
}

const CATEGORY_ICONS: Record<string, string> = {
  creative: '✨',
  opinion: '💭',
  description: '🎨',
  letter: '✉️',
};

export default function WritingJournal({ open, onClose }: Props) {
  const [entries, setEntries] = useState(loadEntries);
  const [selectedId, setSelectedId] = useState(PROMPTS[0].id);
  const selected = useMemo(() => PROMPTS.find((p) => p.id === selectedId), [selectedId]);
  const [text, setText] = useState(entries[selectedId] || '');

  const save = useCallback(() => {
    const updated = { ...entries, [selectedId]: text };
    setEntries(updated);
    saveEntries(updated);
  }, [entries, selectedId, text]);

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const writtenCount = Object.values(entries).filter((v) => v.trim().length > 0).length;

  if (!open) return null;

  const btnStyle: React.CSSProperties = {
    fontFamily: 'Georgia, serif', fontSize: '0.78rem',
    padding: '0.4rem 1rem', background: 'transparent',
    border: '1px solid #3a3228', color: '#c5a55a',
    borderRadius: 4, cursor: 'pointer',
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: Z_TOOL,
        background: 'rgba(10,9,8,0.94)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Georgia, serif',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '92%', maxWidth: 580, maxHeight: '85vh',
          background: 'linear-gradient(135deg, #1a1816, #221f1c)',
          border: '1px solid #2a2420',
          borderRadius: 8,
          padding: '1.5rem',
          overflowY: 'auto',
          display: 'flex', flexDirection: 'column',
        }}
      >
        <p style={{
          fontSize: '0.65rem', color: '#4a3a2e',
          letterSpacing: '0.15em', margin: '0 0 0.6rem',
          textAlign: 'center',
        }}>
          WRITING JOURNAL ({writtenCount}/{PROMPTS.length} written)
        </p>

        {/* Prompt selector */}
        <div style={{
          display: 'flex', gap: '0.3rem', flexWrap: 'wrap',
          justifyContent: 'center', marginBottom: '0.8rem',
        }}>
          {PROMPTS.map((p) => {
            const hasEntry = (entries[p.id] || '').trim().length > 0;
            return (
              <button
                key={p.id}
                onClick={() => { save(); setSelectedId(p.id); setText(entries[p.id] || ''); }}
                style={{
                  ...btnStyle,
                  fontSize: '0.68rem',
                  padding: '0.2rem 0.5rem',
                  background: selectedId === p.id ? 'rgba(197,165,90,0.12)' : 'transparent',
                  borderColor: selectedId === p.id ? '#c5a55a' : '#2a2420',
                  color: hasEntry ? '#8aafb0' : (selectedId === p.id ? '#c5a55a' : '#4a3a2e'),
                }}
              >
                {CATEGORY_ICONS[p.category]} {p.id.replace('wp-', '#')}
              </button>
            );
          })}
        </div>

        {selected && (
          <>
            {/* Prompt */}
            <div style={{
              background: 'rgba(197,165,90,0.06)',
              borderLeft: '3px solid #c5a55a',
              borderRadius: '0 4px 4px 0',
              padding: '0.6rem 0.8rem',
              marginBottom: '0.6rem',
            }}>
              <p style={{ fontSize: '0.85rem', color: '#c5a55a', margin: '0 0 0.3rem' }}>
                {selected.prompt}
              </p>
              <p style={{ fontSize: '0.72rem', color: '#6a5a48', margin: '0 0 0.3rem' }}>
                {selected.promptZh}
              </p>
              <p style={{ fontSize: '0.68rem', color: '#5a5a50', fontStyle: 'italic', margin: 0 }}>
                Tip: {selected.hint}
              </p>
            </div>

            {/* Text area */}
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onBlur={save}
              placeholder="Write your response in English..."
              style={{
                width: '100%',
                minHeight: 150,
                fontFamily: 'Georgia, serif',
                fontSize: '0.88rem',
                padding: '0.8rem',
                background: '#0a0908',
                border: '1px solid #2a2420',
                color: '#e0d8cc',
                borderRadius: 6,
                outline: 'none',
                resize: 'vertical',
                lineHeight: 1.7,
                boxSizing: 'border-box',
              }}
            />

            {/* Word count + save */}
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginTop: '0.5rem',
            }}>
              <span style={{ fontSize: '0.7rem', color: '#4a3a2e' }}>
                {wordCount} word{wordCount !== 1 ? 's' : ''}
              </span>
              <button onClick={save} style={btnStyle}>
                Save
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
