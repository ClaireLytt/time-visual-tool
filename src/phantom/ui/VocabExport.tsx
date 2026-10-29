import { Z_TOOL } from '../core/z-index';
/**
 * VocabExport — export all learned vocabulary as a formatted study list.
 * Copy to clipboard or view as a printable summary.
 */
import { useState, useMemo, useCallback } from 'react';
import { ENGLISH_CHALLENGES } from '../core/english-challenges';
import { getUnlockedIdioms } from '../core/idioms';
import { useGameStore } from '../core/store';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function VocabExport({ open, onClose }: Props) {
  const learning = useGameStore((s) => s.learning);
  const collectedItems = useGameStore((s) => s.collectedItems);
  const [copied, setCopied] = useState(false);

  const exportText = useMemo(() => {
    const lines: string[] = [];
    lines.push('THE PHANTOM OF THE OPERA — Vocabulary Study List');
    lines.push('=' .repeat(50));
    lines.push('');

    // Vocabulary words
    const challenges = ENGLISH_CHALLENGES.filter(
      (ch) => learning.completedChallenges.includes(ch.id)
    );

    if (challenges.length > 0) {
      lines.push('VOCABULARY');
      lines.push('-'.repeat(30));
      challenges.forEach((ch) => {
        lines.push(`[${ch.source}]`);
        ch.vocab.forEach((v) => {
          let line = `  ${v.word} ${v.phonetic} — ${v.meaning}`;
          if (v.etymology) line += `\n    Origin: ${v.etymology}`;
          line += `\n    Ex: ${v.example}`;
          line += `\n    ${v.exampleZh}`;
          lines.push(line);
        });
        lines.push('');
      });
    }

    // Idioms
    const idioms = getUnlockedIdioms(collectedItems);
    if (idioms.length > 0) {
      lines.push('IDIOMS');
      lines.push('-'.repeat(30));
      idioms.forEach((idiom) => {
        lines.push(`  "${idiom.idiom}"`);
        lines.push(`    = ${idiom.meaning}`);
        lines.push(`    = ${idiom.meaningZh}`);
        lines.push('');
      });
    }

    // Key phrases from environment
    if (learning.phrasesCollected && learning.phrasesCollected.length > 0) {
      lines.push('PHRASES');
      lines.push('-'.repeat(30));
      lines.push('  (Collected from exploring the opera house)');
      lines.push(`  Total: ${learning.phrasesCollected.length} phrases discovered`);
      lines.push('');
    }

    // Stats
    lines.push('STATS');
    lines.push('-'.repeat(30));
    lines.push(`  Score: ${learning.totalScore}`);
    lines.push(`  Challenges: ${learning.completedChallenges.length}/${ENGLISH_CHALLENGES.length}`);
    lines.push(`  Words: ${challenges.reduce((s, c) => s + c.vocab.length, 0)}`);
    lines.push(`  Idioms: ${idioms.length}/8`);
    lines.push('');
    lines.push('Generated from The Phantom of the Opera English Learning Game');

    return lines.join('\n');
  }, [learning, collectedItems]);

  const wordCount = useMemo(() => {
    return ENGLISH_CHALLENGES
      .filter((ch) => learning.completedChallenges.includes(ch.id))
      .reduce((s, c) => s + c.vocab.length, 0);
  }, [learning.completedChallenges]);

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(exportText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = exportText;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [exportText]);

  if (!open) return null;

  const btnStyle: React.CSSProperties = {
    fontFamily: 'Georgia, serif', fontSize: '0.82rem',
    padding: '0.5rem 1.4rem', background: 'transparent',
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
          width: '92%', maxWidth: 520, maxHeight: '85vh',
          background: 'linear-gradient(135deg, #1a1816, #221f1c)',
          border: '1px solid #2a2420',
          borderRadius: 8,
          padding: '1.5rem',
          overflowY: 'auto',
        }}
      >
        <p style={{
          fontSize: '0.65rem', color: '#4a3a2e',
          letterSpacing: '0.15em', margin: '0 0 0.5rem',
          textAlign: 'center',
        }}>
          EXPORT VOCABULARY
        </p>
        <p style={{
          fontSize: '0.78rem', color: '#6a5a48',
          textAlign: 'center', margin: '0 0 1rem',
        }}>
          {wordCount} words · {getUnlockedIdioms(collectedItems).length} idioms
        </p>

        {/* Preview */}
        <pre style={{
          fontFamily: 'Consolas, monospace',
          fontSize: '0.68rem',
          color: '#9a8a78',
          background: '#0a0908',
          border: '1px solid #2a2420',
          borderRadius: 4,
          padding: '0.8rem',
          maxHeight: 300,
          overflowY: 'auto',
          whiteSpace: 'pre-wrap',
          lineHeight: 1.5,
        }}>
          {exportText}
        </pre>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', marginTop: '1rem' }}>
          <button onClick={copyToClipboard} style={{
            ...btnStyle,
            background: copied ? 'rgba(100,160,100,0.12)' : 'transparent',
            borderColor: copied ? 'rgba(100,160,100,0.4)' : '#3a3228',
            color: copied ? '#a0c8a0' : '#c5a55a',
          }}>
            {copied ? '✅ Copied!' : '📋 Copy to Clipboard'}
          </button>
          <button onClick={onClose} style={{ ...btnStyle, color: '#6a5a48' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
