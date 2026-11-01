/**
 * NPCDialogue — free-form conversation with NPCs.
 * Shows a topic menu, then plays the response lines with typewriter effect.
 * Teaches vocabulary through conversation.
 */
import { useState, useCallback } from 'react';
import { useGameStore } from '../core/store';
import { getAvailableTopics } from '../core/npcs';
import { Z_DIALOGUE } from '../core/z-index';
import { NPCConfig, NPCTopic, DialogueLine } from '../core/types';

interface Props {
  npc: NPCConfig | null;
  onClose: () => void;
}

type Phase = 'topics' | 'talking';

export default function NPCDialogue({ npc, onClose }: Props) {
  const triggeredEvents = useGameStore((s) => s.triggeredEvents);
  const reviewVocab = useGameStore((s) => s.reviewVocab);
  const [phase, setPhase] = useState<Phase>('topics');
  const [currentLines, setCurrentLines] = useState<DialogueLine[]>([]);
  const [lineIdx, setLineIdx] = useState(0);
  const [currentTopic, setCurrentTopic] = useState<NPCTopic | undefined>(undefined);
  const [seenTopics, setSeenTopics] = useState<Set<string>>(new Set());

  const topics = npc ? getAvailableTopics(npc, triggeredEvents) : [];

  const selectTopic = useCallback((topic: NPCTopic) => {
    setCurrentTopic(topic);
    setCurrentLines(topic.response);
    setLineIdx(0);
    setPhase('talking');
    setSeenTopics((s) => new Set([...s, topic.id]));
    if (topic.vocabWord) reviewVocab(topic.vocabWord);
  }, [reviewVocab]);

  const advance = useCallback(() => {
    if (lineIdx < currentLines.length - 1) {
      setLineIdx((i) => i + 1);
    } else {
      setPhase('topics');
      setCurrentTopic(undefined);
    }
  }, [lineIdx, currentLines.length]);

  if (!npc) return null;

  const line = currentLines[lineIdx];

  return (
    <div
      onClick={phase === 'talking' ? advance : undefined}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(10,9,8,0.85)',
        display: 'flex', flexDirection: 'column',
        justifyContent: phase === 'topics' ? 'center' : 'flex-end',
        alignItems: 'center',
        zIndex: Z_DIALOGUE,
        cursor: phase === 'talking' ? 'pointer' : 'default',
        fontFamily: 'Georgia, serif',
      }}
    >
      {phase === 'topics' ? (
        /* Topic selection menu */
        <div style={{
          maxWidth: 420, width: '90%',
          background: 'linear-gradient(145deg, #1a1816, #221f1c)',
          border: '1px solid #2a2420',
          borderRadius: 8,
          padding: '1.5rem',
        }}>
          {/* NPC header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.8rem' }}>
            <span style={{ fontSize: '1.5rem' }}>{npc.icon}</span>
            <div>
              <p style={{ fontSize: '1rem', color: '#c5a55a', margin: 0, fontWeight: 'bold' }}>
                {npc.name}
              </p>
              <p style={{ fontSize: '0.7rem', color: '#6a5a48', margin: 0 }}>
                {npc.nameEn}
              </p>
            </div>
          </div>

          {/* Greeting */}
          <p style={{ fontSize: '0.85rem', color: '#d8ccb4', margin: '0 0 0.3rem' }}>
            {npc.greeting}
          </p>
          <p style={{ fontSize: '0.72rem', color: '#6a5a48', fontStyle: 'italic', margin: '0 0 1rem' }}>
            {npc.greetingEn}
          </p>

          {/* Topics */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {topics.map((topic) => (
              <button
                key={topic.id}
                onClick={() => selectTopic(topic)}
                style={{
                  fontFamily: 'Georgia, serif',
                  fontSize: '0.85rem',
                  padding: '0.6rem 0.8rem',
                  background: seenTopics.has(topic.id) ? 'rgba(100,90,80,0.06)' : 'rgba(197,165,90,0.06)',
                  border: `1px solid ${seenTopics.has(topic.id) ? '#2a2420' : 'rgba(197,165,90,0.2)'}`,
                  borderRadius: 6,
                  color: seenTopics.has(topic.id) ? '#6a5a48' : '#c5a55a',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}
              >
                <div>
                  <span>{topic.label}</span>
                  <br />
                  <span style={{ fontSize: '0.68rem', color: '#5a5a50', fontStyle: 'italic' }}>
                    {topic.labelEn}
                  </span>
                </div>
                {topic.vocabWord && !seenTopics.has(topic.id) && (
                  <span style={{ fontSize: '0.6rem', color: '#8aafb0', marginLeft: '0.5rem' }}>
                    +vocab
                  </span>
                )}
                {seenTopics.has(topic.id) && (
                  <span style={{ fontSize: '0.6rem', color: '#4a3a2e' }}>{'✓'}</span>
                )}
              </button>
            ))}
          </div>

          {/* Leave button */}
          <button
            onClick={onClose}
            style={{
              fontFamily: 'Georgia, serif',
              fontSize: '0.78rem',
              padding: '0.4rem 1rem',
              background: 'transparent',
              border: '1px solid #2a2420',
              color: '#6a5a48',
              borderRadius: 4,
              cursor: 'pointer',
              marginTop: '0.8rem',
              width: '100%',
            }}
          >
            Leave conversation
          </button>
        </div>
      ) : (
        /* Dialogue playback */
        <div style={{
          width: '100%',
          background: 'linear-gradient(to top, rgba(30,26,22,0.97), rgba(30,26,22,0.85))',
          padding: '1.5rem 2rem 2rem',
          minHeight: 140,
          borderTop: '1px solid #3a3228',
        }}>
          {line && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.6rem' }}>
                <span style={{ fontSize: '0.9rem' }}>{npc.icon}</span>
                <span style={{ fontSize: '0.85rem', color: '#c5a55a', fontWeight: 'bold', letterSpacing: '0.08em' }}>
                  {line.speaker}
                </span>
              </div>
              <p style={{ fontSize: '1rem', color: '#e0d8cc', lineHeight: 1.8, margin: '0 0 0.3rem' }}>
                {line.text}
              </p>
              {line.textEn && (
                <p style={{ fontSize: '0.78rem', color: '#7a7a6a', fontStyle: 'italic', margin: '0 0 0.5rem' }}>
                  EN: {line.textEn}
                </p>
              )}

              {/* Vocab badge on last line */}
              {lineIdx === currentLines.length - 1 && currentTopic?.vocabWord && (
                <div style={{
                  background: 'rgba(138,175,176,0.08)',
                  borderLeft: '3px solid #8aafb0',
                  borderRadius: '0 4px 4px 0',
                  padding: '0.4rem 0.6rem',
                  marginTop: '0.5rem',
                }}>
                  <span style={{ fontSize: '0.75rem', color: '#8aafb0' }}>
                    New word: <strong>{currentTopic.vocabWord}</strong> = {currentTopic.vocabMeaning}
                  </span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.6rem' }}>
                <span style={{ fontSize: '0.65rem', color: '#4a3a2e' }}>
                  {lineIdx + 1}/{currentLines.length}
                </span>
                <span style={{ fontSize: '0.65rem', color: '#4a3a2e' }}>
                  {lineIdx < currentLines.length - 1 ? 'Click for next' : 'Click to return'}
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
