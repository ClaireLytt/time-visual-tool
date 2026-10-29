/**
 * SpeakingPractice — oral dialogue simulation using Web Speech APIs.
 * TTS speaks a prompt, player records their response via Speech Recognition,
 * then compares against the expected answer.
 */
import { useState, useCallback, useRef } from 'react';
import { Z_TOOL } from '../core/z-index';
import { playCorrect, playWrong } from '../audio/ui-sfx';

interface Props {
  open: boolean;
  onClose: () => void;
}

interface Prompt {
  id: string;
  scene: string;
  sceneZh: string;
  /** What the NPC says (played via TTS) */
  npcLine: string;
  npcLineZh: string;
  /** Expected player response */
  expectedResponse: string;
  expectedResponseZh: string;
  /** Acceptable keywords (partial match) */
  keywords: string[];
  /** Hint for the player */
  hint: string;
}

const PROMPTS: Prompt[] = [
  {
    id: 'sp-1',
    scene: 'Backstage — Madame Giry asks you',
    sceneZh: '后台 — 吉里夫人问你',
    npcLine: 'Have you seen anything strange in the opera house?',
    npcLineZh: '你在歌剧院里看到什么奇怪的事情了吗？',
    expectedResponse: 'Yes, I saw a shadow moving behind the curtain.',
    expectedResponseZh: '是的，我看到帷幕后面有个影子在动。',
    keywords: ['shadow', 'curtain', 'saw', 'behind', 'strange', 'yes'],
    hint: 'Mention what you saw: a shadow, the curtain, something strange.',
  },
  {
    id: 'sp-2',
    scene: 'Rooftop — Raoul asks you',
    sceneZh: '屋顶 — 拉乌尔问你',
    npcLine: 'Do you think Christine is safe with the Phantom?',
    npcLineZh: '你觉得克里斯汀和魅影在一起安全吗？',
    expectedResponse: 'I think he would never hurt her. He loves her music.',
    expectedResponseZh: '我觉得他永远不会伤害她。他爱她的音乐。',
    keywords: ['never', 'hurt', 'love', 'music', 'safe', 'think'],
    hint: 'Express your opinion: do you think he is dangerous or caring?',
  },
  {
    id: 'sp-3',
    scene: 'Underground lake — The Phantom asks you',
    sceneZh: '地下湖 — 魅影问你',
    npcLine: 'What do you see when you look at my face?',
    npcLineZh: '当你看着我的脸时，你看到了什么？',
    expectedResponse: 'I see a man who has suffered, but whose music is beautiful.',
    expectedResponseZh: '我看到一个受过苦的人，但他的音乐很美。',
    keywords: ['man', 'music', 'beautiful', 'see', 'suffer', 'person'],
    hint: 'Describe what you see: a person, not a monster. Mention his music.',
  },
  {
    id: 'sp-4',
    scene: 'Dressing room — Christine asks you',
    sceneZh: '化妆间 — 克里斯汀问你',
    npcLine: 'Should I follow the voice behind the mirror?',
    npcLineZh: '我应该跟随镜子后面的声音吗？',
    expectedResponse: 'Be careful, but follow your heart. The truth is waiting for you.',
    expectedResponseZh: '小心点，但跟随你的心。真相在等着你。',
    keywords: ['careful', 'follow', 'heart', 'truth', 'waiting', 'voice'],
    hint: 'Give advice: be careful, follow your heart, the truth awaits.',
  },
];

function speak(text: string) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US';
  u.rate = 0.85;
  const voices = window.speechSynthesis.getVoices();
  const en = voices.find((v) => v.lang.startsWith('en'));
  if (en) u.voice = en;
  window.speechSynthesis.speak(u);
}

/* eslint-disable @typescript-eslint/no-explicit-any */
const _win = typeof window !== 'undefined' ? (window as unknown as Record<string, any>) : undefined;
const SpeechRecognitionAPI: (new () => any) | undefined =
  _win ? (_win.SpeechRecognition || _win.webkitSpeechRecognition) : undefined;
/* eslint-enable @typescript-eslint/no-explicit-any */

type Phase = 'listen' | 'recording' | 'result';

export default function SpeakingPractice({ open, onClose }: Props) {
  const [promptIdx, setPromptIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>('listen');
  const [transcript, setTranscript] = useState('');
  const [matchScore, setMatchScore] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  const prompt = PROMPTS[promptIdx];
  const hasSR = !!SpeechRecognitionAPI;
  const hasTTS = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const playPrompt = useCallback(() => {
    speak(prompt.npcLine);
  }, [prompt]);

  const startRecording = useCallback(() => {
    if (!SpeechRecognitionAPI) return;
    const sr = new SpeechRecognitionAPI();
    sr.lang = 'en-US';
    sr.continuous = false;
    sr.interimResults = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sr.onresult = (e: any) => {
      const text = e.results[0][0].transcript;
      setTranscript(text);
      // Score: count matching keywords
      const lower = text.toLowerCase();
      const matched = prompt.keywords.filter((kw) => lower.includes(kw));
      const score = Math.round((matched.length / prompt.keywords.length) * 100);
      setMatchScore(score);
      if (score >= 50) playCorrect(); else playWrong();
      setPhase('result');
    };
    sr.onerror = () => {
      setPhase('listen');
    };
    recognitionRef.current = sr;
    sr.start();
    setPhase('recording');
  }, [prompt]);

  const stopRecording = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const nextPrompt = useCallback(() => {
    setPromptIdx((i) => (i + 1) % PROMPTS.length);
    setPhase('listen');
    setTranscript('');
    setMatchScore(0);
  }, []);

  if (!open) return null;

  if (!hasTTS || !hasSR) {
    return (
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(10,9,8,0.92)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: Z_TOOL, cursor: 'pointer', fontFamily: 'Georgia, serif',
      }}>
        <div style={{ color: '#6a5a48', textAlign: 'center' }}>
          <p style={{ fontSize: '2rem', margin: '0 0 0.5rem' }}>{'🎙️'}</p>
          <p>{!hasTTS ? 'Text-to-Speech not available' : 'Speech Recognition not available'}</p>
          <p style={{ fontSize: '0.78rem', color: '#4a3a2e' }}>
            This feature requires a browser with Web Speech API support (Chrome recommended).
          </p>
        </div>
      </div>
    );
  }

  const btnStyle: React.CSSProperties = {
    fontFamily: 'Georgia, serif', fontSize: '0.85rem',
    padding: '0.5rem 1.5rem', background: 'transparent',
    border: '1px solid #3a3228', color: '#c5a55a',
    borderRadius: 4, cursor: 'pointer',
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      zIndex: Z_TOOL,
      background: 'rgba(10,9,8,0.94)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Georgia, serif',
    }}>
      <p style={{ fontSize: '0.7rem', color: '#6a5a48', letterSpacing: '0.15em', margin: '0 0 0.3rem' }}>
        SPEAKING PRACTICE ({promptIdx + 1}/{PROMPTS.length})
      </p>

      {/* Scene */}
      <p style={{ fontSize: '0.72rem', color: '#4a3a2e', margin: '0 0 0.8rem' }}>
        {prompt.scene} / {prompt.sceneZh}
      </p>

      {/* NPC line */}
      <div style={{
        maxWidth: 440, width: '90%',
        background: 'rgba(197,165,90,0.06)',
        borderLeft: '3px solid #c5a55a',
        borderRadius: '0 6px 6px 0',
        padding: '0.8rem 1rem',
        marginBottom: '0.8rem',
      }}>
        <p style={{ fontSize: '0.9rem', color: '#c5a55a', fontStyle: 'italic', margin: '0 0 0.3rem' }}>
          &ldquo;{prompt.npcLine}&rdquo;
        </p>
        <p style={{ fontSize: '0.72rem', color: '#6a5a48', margin: 0 }}>
          {prompt.npcLineZh}
        </p>
      </div>

      {/* Play button */}
      <button onClick={playPrompt} style={{ ...btnStyle, marginBottom: '0.8rem' }}>
        {'🔊'} Listen Again
      </button>

      {phase === 'listen' && (
        <>
          <p style={{ fontSize: '0.78rem', color: '#8aafb0', margin: '0 0 0.5rem' }}>
            Hint: {prompt.hint}
          </p>
          <button onClick={startRecording} style={{
            ...btnStyle, fontSize: '1rem', padding: '0.6rem 2rem',
            border: '1px solid #c87a6a', color: '#c87a6a',
          }}>
            {'🎙️'} Record Your Answer
          </button>
        </>
      )}

      {phase === 'recording' && (
        <div style={{ textAlign: 'center' }}>
          <p style={{
            fontSize: '1rem', color: '#c87a6a',
            animation: 'recPulse 1s ease infinite',
          }}>
            {'🔴'} Recording... speak now
          </p>
          <button onClick={stopRecording} style={{ ...btnStyle, color: '#c87a6a', borderColor: '#c87a6a', marginTop: '0.5rem' }}>
            Stop
          </button>
        </div>
      )}

      {phase === 'result' && (
        <div style={{ maxWidth: 440, width: '90%', textAlign: 'center' }}>
          {/* Your answer */}
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid #2a2420',
            borderRadius: 6,
            padding: '0.6rem 0.8rem',
            marginBottom: '0.6rem',
          }}>
            <p style={{ fontSize: '0.6rem', color: '#4a3a2e', letterSpacing: '0.1em', margin: '0 0 0.2rem' }}>
              YOU SAID
            </p>
            <p style={{ fontSize: '0.88rem', color: '#d8ccb4', margin: 0 }}>
              {transcript || '(no speech detected)'}
            </p>
          </div>

          {/* Score */}
          <p style={{
            fontSize: '1.2rem', fontWeight: 'bold', margin: '0 0 0.3rem',
            color: matchScore >= 80 ? '#a0c8a0' : matchScore >= 50 ? '#c5a55a' : '#c87a6a',
          }}>
            {matchScore}% match
          </p>
          <p style={{ fontSize: '0.78rem', color: '#6a5a48', margin: '0 0 0.5rem' }}>
            {matchScore >= 80 ? 'Excellent pronunciation!' : matchScore >= 50 ? 'Good try!' : 'Keep practicing!'}
          </p>

          {/* Expected */}
          <div style={{
            background: 'rgba(138,175,176,0.06)',
            borderLeft: '3px solid #8aafb0',
            borderRadius: '0 4px 4px 0',
            padding: '0.5rem 0.8rem',
            marginBottom: '0.8rem',
            textAlign: 'left',
          }}>
            <p style={{ fontSize: '0.6rem', color: '#5a6a6a', letterSpacing: '0.1em', margin: '0 0 0.2rem' }}>
              SUGGESTED ANSWER
            </p>
            <p style={{ fontSize: '0.82rem', color: '#8aafb0', fontStyle: 'italic', margin: '0 0 0.2rem' }}>
              {prompt.expectedResponse}
            </p>
            <p style={{ fontSize: '0.7rem', color: '#5a5a50', margin: 0 }}>
              {prompt.expectedResponseZh}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center' }}>
            <button onClick={() => { setPhase('listen'); setTranscript(''); }} style={btnStyle}>
              {'🎙️'} Try Again
            </button>
            <button onClick={nextPrompt} style={btnStyle}>
              Next {'→'}
            </button>
          </div>
        </div>
      )}

      <button onClick={onClose} style={{
        ...btnStyle, color: '#3a3228', borderColor: '#2a2420', marginTop: '1rem',
      }}>
        Close
      </button>

      <style>{`
        @keyframes recPulse { 0%,100% { opacity: 1 } 50% { opacity: 0.5 } }
      `}</style>
    </div>
  );
}
