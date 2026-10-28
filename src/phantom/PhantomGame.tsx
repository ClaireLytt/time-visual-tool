import { useState, useCallback, useEffect, useRef } from 'react';
import { useGameStore } from './core/store';
import Canvas2D from './renderer-2d/Canvas2D';
import ParchmentOverlay from './ui/ParchmentOverlay';
import Transition from './ui/Transition';
import { useTransition } from './ui/useTransition';
import IntroText from './ui/IntroText';
import InventoryJournal from './ui/InventoryJournal';
import DialogueOverlay from './ui/DialogueOverlay';
import EnglishChallengeModal from './ui/EnglishChallenge';
import AchievementToast from './ui/AchievementToast';
import FlashcardReview from './ui/FlashcardReview';
import WordScramble from './ui/WordScramble';
import EnvDescriptionOverlay from './ui/EnvDescriptionOverlay';
import ActRecap from './ui/ActRecap';
import GameEnding from './ui/GameEnding';
import SentenceBuilder from './ui/SentenceBuilder';
import CharacterProfiles from './ui/CharacterProfiles';
import ProgressMap from './ui/ProgressMap';
import ReadingPassages from './ui/ReadingPassages';
import DailyChallenge from './ui/DailyChallenge';
import IdiomCollection from './ui/IdiomCollection';
import StoryTimeline from './ui/StoryTimeline';
import ReviewQuiz from './ui/ReviewQuiz';
import HelpGuide from './ui/HelpGuide';
import PronunciationPractice from './ui/PronunciationPractice';
import WritingJournal from './ui/WritingJournal';
import MiniMap from './ui/MiniMap';
import MemoryMatch from './ui/MemoryMatch';
import ListeningDictation from './ui/ListeningDictation';
import AreaNameToast from './ui/AreaNameToast';
import LearningStats from './ui/LearningStats';
import { initAudio, setArea as setMusicArea, setLayerCount, stopAudio } from './audio/MusicEngine';
import { playPickup } from './audio/sfx';
import { ActId, DialogueScene, EnglishChallenge } from './core/types';
import { getDialogueForTrigger } from './core/dialogues';
import { getChallengeForTrigger, ENGLISH_CHALLENGES } from './core/english-challenges';
import { getEnvDescription, EnvDescription } from './core/environment-descriptions';
import { Achievement, checkNewAchievements, AchievementStats } from './core/achievements';

const AREA_NAMES: Record<string, string> = {
  'theater-audience': '观众席', 'theater-stage': '舞台', 'theater-backstage': '后台通道',
  'dressing-room': '化妆间', 'spiral-stairs': '螺旋石梯',
  'underground-tunnel': '地下隧道', 'underground-lake': '地下湖',
  'lair': '魅影的密室', 'rooftop': '歌剧院屋顶',
  'theater-performance': '剧场（演出）', 'final-lair': '地下湖密室', 'epilogue': '终章',
};

const ACT_START_AREAS: Record<number, string> = {
  1: 'theater-audience', 2: 'dressing-room', 3: 'lair',
  4: 'rooftop', 5: 'theater-performance',
};

const menuBtnStyle: React.CSSProperties = {
  fontFamily: 'Georgia, serif',
  fontSize: '0.9rem',
  padding: '0.6rem 2.2rem',
  background: 'transparent',
  border: '1px solid #4a3a2e',
  color: '#c5a55a',
  borderRadius: '4px',
  cursor: 'pointer',
  letterSpacing: '0.08em',
  width: '200px',
  textAlign: 'center',
};

export default function PhantomGame() {
  const {
    isPlaying, isPaused, startGame, togglePause, resetGame,
    collectedItems, currentArea, currentAct, setAct, setArea, loadGame, saveGame,
    learning,
  } = useGameStore();

  const [viewingItem, setViewingItem] = useState<string | null>(null);
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [activeDialogue, setActiveDialogue] = useState<DialogueScene | null>(null);
  const [activeChallenge, setActiveChallenge] = useState<EnglishChallenge | null>(null);
  const [pendingChallengeId, setPendingChallengeId] = useState<string | null>(null);
  const [flashcardsOpen, setFlashcardsOpen] = useState(false);
  const [scrambleOpen, setScrambleOpen] = useState(false);
  const [sentenceOpen, setSentenceOpen] = useState(false);
  const [profilesOpen, setProfilesOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [readingOpen, setReadingOpen] = useState(false);
  const [idiomsOpen, setIdiomsOpen] = useState(false);
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [pronunciationOpen, setPronunciationOpen] = useState(false);
  const [writingOpen, setWritingOpen] = useState(false);
  const [memoryOpen, setMemoryOpen] = useState(false);
  const [dictationOpen, setDictationOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [envDesc, setEnvDesc] = useState<EnvDescription | null>(null);
  const [showRecap, setShowRecap] = useState<ActId | null>(null);
  const [showEnding, setShowEnding] = useState(false);
  const [toastAchievement, setToastAchievement] = useState<Achievement | null>(null);
  const [earnedAchievements, setEarnedAchievements] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('phantom-achievements');
      return raw ? JSON.parse(raw) as string[] : [];
    } catch { return []; }
  });
  const [dialoguesWatched, setDialoguesWatched] = useState(0);
  const { transition, startTransition } = useTransition();
  const audioStarted = useRef(false);
  const [hasSave] = useState(() => {
    try { return localStorage.getItem('phantom-save') !== null; }
    catch { return false; }
  });

  // Subscribe to collectible changes (only while actively playing)
  useEffect(() => {
    let prevCount = -1; // -1 = not yet synced
    const unsub = useGameStore.subscribe((state) => {
      // Don't trigger overlays until game is playing and we've synced
      if (!state.isPlaying) {
        prevCount = -1;
        return;
      }
      if (prevCount === -1) {
        // First tick after game starts — sync count, don't show overlay
        prevCount = state.collectedItems.length;
        return;
      }
      const count = state.collectedItems.length;
      if (count > prevCount) {
        prevCount = count;
        const itemId = state.collectedItems[count - 1];
        setViewingItem(itemId);
        playPickup();
        setLayerCount(count);
        // Queue English challenge for this collectible
        const ch = getChallengeForTrigger(itemId);
        if (ch && !state.learning.completedChallenges.includes(ch.id)) {
          setPendingChallengeId(ch.id);
        }
        // Check for game ending (final mask collected)
        if (itemId === 'act5-mask') {
          setTimeout(() => setShowEnding(true), 3000);
        }
        // Check achievements
        // Achievement check is deferred to avoid stale closure
        setTimeout(() => {
          // Re-read from store directly
          const st = useGameStore.getState();
          const earned = JSON.parse(localStorage.getItem('phantom-achievements') || '[]') as string[];
          const achStats: AchievementStats = {
            collectiblesFound: st.collectedItems.length,
            challengesCompleted: st.learning.completedChallenges.length,
            challengesPassed: st.learning.completedChallenges.length,
            totalScore: st.learning.totalScore,
            actsCompleted: st.currentAct,
            dialoguesWatched: 0,
            vocabLearned: ENGLISH_CHALLENGES
              .filter((ch) => st.learning.completedChallenges.includes(ch.id))
              .reduce((sum, ch) => sum + ch.vocab.length, 0),
          };
          const newA = checkNewAchievements(achStats, earned);
          if (newA.length > 0) {
            const updated = [...earned, ...newA.map((a) => a.id)];
            setEarnedAchievements(updated);
            try { localStorage.setItem('phantom-achievements', JSON.stringify(updated)); } catch { /* */ }
            setToastAchievement(newA[0]);
          }
        }, 100);
      }
    });
    return unsub;
  }, []);

  // Sync music area
  useEffect(() => {
    if (isPlaying && audioStarted.current) {
      setMusicArea(currentArea);
    }
  }, [currentArea, isPlaying]);

  // Auto-save on area change
  useEffect(() => {
    if (isPlaying) saveGame();
  }, [currentArea, isPlaying, saveGame]);

  useEffect(() => () => stopAudio(), []);

  // Check achievements whenever relevant state changes
  const checkAchievements = useCallback(() => {
    const state = useGameStore.getState();
    const stats: AchievementStats = {
      collectiblesFound: state.collectedItems.length,
      challengesCompleted: state.learning.completedChallenges.length,
      challengesPassed: state.learning.completedChallenges.length, // simplified
      totalScore: state.learning.totalScore,
      actsCompleted: state.currentAct,
      dialoguesWatched,
      vocabLearned: ENGLISH_CHALLENGES
        .filter((ch) => state.learning.completedChallenges.includes(ch.id))
        .reduce((sum, ch) => sum + ch.vocab.length, 0),
    };
    const newAchievements = checkNewAchievements(stats, earnedAchievements);
    if (newAchievements.length > 0) {
      const first = newAchievements[0];
      const updated = [...earnedAchievements, ...newAchievements.map((a) => a.id)];
      setEarnedAchievements(updated);
      try { localStorage.setItem('phantom-achievements', JSON.stringify(updated)); } catch { /* ignore */ }
      setToastAchievement(first);
    }
  }, [earnedAchievements, dialoguesWatched]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (inventoryOpen) {
        setInventoryOpen(false);
      } else {
        togglePause();
      }
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      setInventoryOpen((v) => !v);
    }
    if (e.key === 'm' || e.key === 'M') {
      setMapOpen((v) => !v);
    }
    if (e.key === 'h' || e.key === 'H') {
      setHelpOpen((v) => !v);
    }
  }, [togglePause, inventoryOpen]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const doStart = useCallback(async (act?: ActId, area?: string) => {
    await initAudio();
    audioStarted.current = true;
    if (act) {
      setAct(act);
      setArea(area || ACT_START_AREAS[act]);
    }
    setMusicArea(area || ACT_START_AREAS[act || 1]);
    startTransition('curtain-rise', () => {
      startGame();
      // Show help on first ever play
      try {
        if (!localStorage.getItem('phantom-help-shown')) {
          localStorage.setItem('phantom-help-shown', '1');
          setTimeout(() => setHelpOpen(true), 1500);
        }
      } catch { /* ignore */ }
    }, 3000);
  }, [setAct, setArea, startGame, startTransition]);

  // ── Intro text overlay ──
  if (showIntro) {
    return <IntroText onComplete={() => { setShowIntro(false); doStart(); }} />;
  }

  // ── Title screen ──
  if (!isPlaying) {
    return (
      <div style={{
        minHeight: '100vh', background: '#0a0908',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        color: '#e0d8cc', fontFamily: 'Georgia, serif', gap: '1rem',
      }}>
        <h1 style={{
          fontSize: '2.4rem', letterSpacing: '0.12em', margin: 0,
          textShadow: '0 2px 16px rgba(0,0,0,0.8)',
        }}>
          THE PHANTOM
        </h1>
        <p style={{ fontSize: '1.1rem', letterSpacing: '0.2em', color: '#9a8a78', margin: 0 }}>
          OF THE OPERA
        </p>
        <div style={{ width: 60, height: 1, background: '#4a3a2e', margin: '0.8rem 0' }} />

        {/* New Game */}
        <button onClick={() => setShowIntro(true)} style={menuBtnStyle}>
          新游戏
        </button>

        {/* Continue (if save exists) */}
        {hasSave && (
          <button
            onClick={async () => {
              loadGame();
              await initAudio();
              audioStarted.current = true;
              const area = useGameStore.getState().currentArea;
              setMusicArea(area);
              startTransition('fade', () => startGame(), 1500);
            }}
            style={menuBtnStyle}
          >
            继续游戏
          </button>
        )}

        {/* Chapter select */}
        <div style={{
          marginTop: '0.5rem',
          display: 'flex', flexDirection: 'column', gap: '0.4rem',
          alignItems: 'center',
        }}>
          <p style={{ fontSize: '0.72rem', color: '#4a3a2e', margin: '0.3rem 0' }}>
            ── 章节选择 ──
          </p>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {([1, 2, 3, 4, 5] as ActId[]).map((act) => (
              <button
                key={act}
                onClick={() => {
                  resetGame();
                  try { localStorage.removeItem('phantom-save'); } catch { /* */ }
                  doStart(act);
                }}
                style={{
                  ...menuBtnStyle,
                  width: 'auto',
                  padding: '0.35rem 1rem',
                  fontSize: '0.75rem',
                }}
              >
                第{act}幕
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginTop: '1.5rem' }}>
          <p style={{ fontSize: '0.65rem', color: '#3a3028', margin: 0 }}>
            点击场景移动视角 · 点击发光物品互动 · Tab 背包 · ESC 暂停
          </p>
          <button
            onClick={() => setHelpOpen(true)}
            style={{
              fontFamily: 'Georgia, serif', fontSize: '0.65rem',
              padding: '0.2rem 0.6rem', background: 'transparent',
              border: '1px solid #3a3028', color: '#6a5a48',
              borderRadius: 3, cursor: 'pointer',
            }}
          >
            ? 帮助
          </button>
        </div>

        {/* Daily challenge on title screen */}
        <DailyChallenge onComplete={() => {}} />

        {/* Learning stats on title screen */}
        {(learning.totalScore > 0 || learning.completedChallenges.length > 0) && (
          <div style={{
            marginTop: '1rem', padding: '0.8rem 1.5rem',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(100,80,60,0.15)',
            borderRadius: 6,
            display: 'flex', gap: '1.5rem', justifyContent: 'center',
          }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '1.1rem', color: '#c5a55a', margin: 0 }}>
                {learning.totalScore}
              </p>
              <p style={{ fontSize: '0.6rem', color: '#4a3a2e', margin: 0 }}>Score</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '1.1rem', color: '#8aafb0', margin: 0 }}>
                {learning.completedChallenges.length}/{ENGLISH_CHALLENGES.length}
              </p>
              <p style={{ fontSize: '0.6rem', color: '#4a3a2e', margin: 0 }}>Challenges</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '1.1rem', color: '#9a8a78', margin: 0 }}>
                {learning.phrasesCollected?.length || 0}
              </p>
              <p style={{ fontSize: '0.6rem', color: '#4a3a2e', margin: 0 }}>Phrases</p>
            </div>
          </div>
        )}

        <HelpGuide open={helpOpen} onClose={() => setHelpOpen(false)} />
        <Transition transition={transition} />
      </div>
    );
  }

  // ── Game screen ──
  return (
    <div style={{
      minHeight: '100vh', background: '#0a0908',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      position: 'relative',
    }}>
      {/* HUD */}
      <div style={{
        position: 'absolute', top: 16, left: 16, right: 16,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        zIndex: 10, pointerEvents: 'none',
      }}>
        <span style={{
          fontFamily: 'Georgia, serif', fontSize: '0.8rem',
          color: '#9a8a78', letterSpacing: '0.08em',
        }}>
          第{currentAct}幕 · {AREA_NAMES[currentArea] || currentArea}
        </span>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', pointerEvents: 'auto' }}>
          {learning.totalScore > 0 && (
            <span style={{
              fontFamily: 'Georgia, serif', fontSize: '0.75rem', color: '#8aafb0',
            }}>
              🎓 {learning.totalScore}
            </span>
          )}
          <button
            onClick={() => setInventoryOpen(true)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'Georgia, serif', fontSize: '0.8rem', color: '#c5a55a',
              padding: '0.2rem 0.5rem',
            }}
            title="背包 (Tab)"
          >
            📖 {collectedItems.length}/15
          </button>
        </div>
      </div>

      <Canvas2D
        onTransition={(type, fn) => startTransition(type, fn)}
        onTriggerFired={(triggerKey) => {
          const dlg = getDialogueForTrigger(triggerKey);
          if (dlg) setActiveDialogue(dlg);
          // Check for act-end triggers to show recap
          if (triggerKey === 'act1-end') setTimeout(() => setShowRecap(1), 2000);
          else if (triggerKey === 'act2-end') setTimeout(() => setShowRecap(2), 2000);
          else if (triggerKey === 'act3-end') setTimeout(() => setShowRecap(3), 6000);
          else if (triggerKey === 'act4-end') setTimeout(() => setShowRecap(4), 2000);
        }}
        onClueClick={(hotspotId) => {
          const desc = getEnvDescription(hotspotId);
          if (desc) setEnvDesc(desc);
        }}
      />

      <AreaNameToast />

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: '0.8rem', marginTop: '0.8rem',
      }}>
        <MiniMap onClick={() => setMapOpen(true)} />
        <p style={{
          fontFamily: 'sans-serif', fontSize: '0.7rem', color: '#4a3a2e',
          margin: 0,
        }}>
          点击场景移动 · Tab 背包 · M 地图 · H 帮助 · ESC 暂停
        </p>
      </div>

      <ParchmentOverlay itemId={viewingItem} onClose={() => {
        setViewingItem(null);
        // Show English challenge if one is queued
        if (pendingChallengeId) {
          const ch = getChallengeForTrigger(viewingItem || '');
          if (ch) setActiveChallenge(ch);
          setPendingChallengeId(null);
        }
      }} />
      <InventoryJournal open={inventoryOpen} onClose={() => setInventoryOpen(false)} />

      {/* Dialogue overlay */}
      {activeDialogue && (
        <DialogueOverlay
          scene={activeDialogue}
          onComplete={() => {
            const challengeId = activeDialogue.challengeId;
            setActiveDialogue(null);
            setDialoguesWatched((d) => d + 1);
            setTimeout(checkAchievements, 100);
            // Chain to English challenge if dialogue has one
            if (challengeId) {
              const { learning: lr } = useGameStore.getState();
              if (!lr.completedChallenges.includes(challengeId)) {
                const ch = ENGLISH_CHALLENGES.find((c) => c.id === challengeId);
                if (ch) setActiveChallenge(ch);
              }
            }
          }}
        />
      )}

      {/* English challenge overlay */}
      {activeChallenge && (
        <EnglishChallengeModal
          challenge={activeChallenge}
          onComplete={(passed) => {
            useGameStore.getState().completeChallenge(activeChallenge.id, passed);
            setActiveChallenge(null);
            setTimeout(checkAchievements, 100);
          }}
        />
      )}

      <EnvDescriptionOverlay desc={envDesc} onClose={() => {
        if (envDesc) {
          useGameStore.getState().collectPhrase(envDesc.id);
        }
        setEnvDesc(null);
      }} />

      <FlashcardReview open={flashcardsOpen} onClose={() => setFlashcardsOpen(false)} />
      <WordScramble open={scrambleOpen} onClose={() => setScrambleOpen(false)} />
      <SentenceBuilder open={sentenceOpen} onClose={() => setSentenceOpen(false)} />
      <CharacterProfiles open={profilesOpen} onClose={() => setProfilesOpen(false)} />
      <ProgressMap open={mapOpen} onClose={() => setMapOpen(false)} />
      <ReadingPassages open={readingOpen} onClose={() => setReadingOpen(false)} />
      <IdiomCollection open={idiomsOpen} onClose={() => setIdiomsOpen(false)} />
      <StoryTimeline open={timelineOpen} onClose={() => setTimelineOpen(false)} />
      <ReviewQuiz open={quizOpen} onClose={() => setQuizOpen(false)} />
      <HelpGuide open={helpOpen} onClose={() => setHelpOpen(false)} />
      <PronunciationPractice open={pronunciationOpen} onClose={() => setPronunciationOpen(false)} />
      <WritingJournal open={writingOpen} onClose={() => setWritingOpen(false)} />
      <MemoryMatch open={memoryOpen} onClose={() => setMemoryOpen(false)} />
      <ListeningDictation open={dictationOpen} onClose={() => setDictationOpen(false)} />
      <LearningStats open={statsOpen} onClose={() => setStatsOpen(false)} earnedAchievements={earnedAchievements} />

      {showRecap && (
        <ActRecap
          completedAct={showRecap}
          onContinue={() => setShowRecap(null)}
        />
      )}

      {showEnding && (
        <GameEnding
          earnedAchievements={earnedAchievements}
          onRestart={() => { setShowEnding(false); resetGame(); }}
        />
      )}

      <AchievementToast
        achievement={toastAchievement}
        onDone={() => setToastAchievement(null)}
      />

      <Transition transition={transition} />

      {/* Pause overlay */}
      {isPaused && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          zIndex: 200,
          fontFamily: 'Georgia, serif',
        }}>
          <h2 style={{ color: '#e0d8cc', fontSize: '1.5rem', margin: '0 0 1rem' }}>
            暂停
          </h2>

          <div style={{
            display: 'flex', gap: '2rem', flexWrap: 'wrap',
            justifyContent: 'center', maxWidth: 500,
          }}>
            {/* Left column: Game */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: 180 }}>
              <p style={{ fontSize: '0.6rem', color: '#4a3a2e', letterSpacing: '0.15em', margin: '0 0 0.2rem' }}>
                GAME
              </p>
              <button onClick={() => togglePause()} style={menuBtnStyle}>
                ▶ 继续游戏
              </button>
              <button onClick={() => setInventoryOpen(true)} style={menuBtnStyle}>
                📖 收集日记
              </button>
              <button onClick={() => setProfilesOpen(true)} style={menuBtnStyle}>
                🎭 人物档案
              </button>
              <button onClick={() => setMapOpen(true)} style={menuBtnStyle}>
                🗺️ 探索地图
              </button>
              <button onClick={() => setTimelineOpen(true)} style={menuBtnStyle}>
                📜 故事时间线
              </button>
              <button onClick={() => setStatsOpen(true)} style={menuBtnStyle}>
                📊 学习统计
              </button>
            </div>

            {/* Right column: English Learning */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: 180 }}>
              <p style={{ fontSize: '0.6rem', color: '#4a3a2e', letterSpacing: '0.15em', margin: '0 0 0.2rem' }}>
                ENGLISH
              </p>
              <button onClick={() => setFlashcardsOpen(true)} style={menuBtnStyle}>
                🎓 复习单词
              </button>
              <button onClick={() => setScrambleOpen(true)} style={menuBtnStyle}>
                🧩 单词拼图
              </button>
              <button onClick={() => setSentenceOpen(true)} style={menuBtnStyle}>
                📝 句子拼装
              </button>
              <button onClick={() => setReadingOpen(true)} style={menuBtnStyle}>
                📚 阅读理解
              </button>
              <button onClick={() => setIdiomsOpen(true)} style={menuBtnStyle}>
                💬 习语收集
              </button>
              <button onClick={() => setQuizOpen(true)} style={menuBtnStyle}>
                🏆 综合测验
              </button>
              <button onClick={() => setPronunciationOpen(true)} style={menuBtnStyle}>
                🔊 发音练习
              </button>
              <button onClick={() => setWritingOpen(true)} style={menuBtnStyle}>
                ✍️ 写作练习
              </button>
              <button onClick={() => setMemoryOpen(true)} style={menuBtnStyle}>
                🃏 记忆配对
              </button>
              <button onClick={() => setDictationOpen(true)} style={menuBtnStyle}>
                🎧 听写练习
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1.2rem' }}>
            <button onClick={() => setHelpOpen(true)} style={{ ...menuBtnStyle, width: 'auto' }}>
              ? 帮助
            </button>
            <button
              onClick={() => { togglePause(); resetGame(); }}
              style={{ ...menuBtnStyle, color: '#8a6a5a', borderColor: '#3a2a22' }}
            >
              返回主菜单
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
