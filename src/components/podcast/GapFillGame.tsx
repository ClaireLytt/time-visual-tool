import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { generateGaps, generateDistractors, shuffleArray, collectAllWords } from '../../utils/gapFill'
import { lookupWord } from '../../api/dictionary'
import type { Segment } from '../../types/podcast'
import type { GapWord } from '../../utils/gapFill'

interface GapFillGameProps {
  segments: Segment[]
  audioRef: React.RefObject<HTMLAudioElement | null>
  onExit: () => void
  onAddToVocab?: (word: string) => void
  difficulty?: 'easy' | 'medium' | 'hard'
}

type GamePhase = 'setup' | 'playing' | 'results'

interface AnswerRecord {
  gap: GapWord
  userAnswer: string
  correct: boolean
  definition: string
}

export default function GapFillGame({
  segments,
  audioRef,
  onExit,
  onAddToVocab,
  difficulty: initialDifficulty = 'medium',
}: GapFillGameProps) {
  const { t } = useTranslation()

  // ─── Setup state ───
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>(initialDifficulty)
  const [phase, setPhase] = useState<GamePhase>('setup')

  // ─── Game state ───
  const [gaps, setGaps] = useState<GapWord[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [options, setOptions] = useState<string[]>([])
  const [answers, setAnswers] = useState<AnswerRecord[]>([])
  const [feedback, setFeedback] = useState<{ correct: boolean; definition: string } | null>(null)
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const activeGapRef = useRef<HTMLSpanElement>(null)

  const allWords = useMemo(() => collectAllWords(segments), [segments])

  // Preview gap count for setup screen
  const [previewCount, setPreviewCount] = useState(0)
  useEffect(() => {
    generateGaps(segments, { difficulty }).then(g => setPreviewCount(g.length))
  }, [segments, difficulty])

  // ─── Start game ───
  const startGame = useCallback(async () => {
    const generated = await generateGaps(segments, { difficulty })
    if (generated.length === 0) return
    setGaps(generated)
    setCurrentIndex(0)
    setAnswers([])
    setFeedback(null)

    // Generate options for first gap
    const first = generated[0]
    const distractors = generateDistractors(first.word, allWords)
    setOptions(shuffleArray([first.word, ...distractors]))

    setPhase('playing')

    // Play from beginning — continuous until first gap
    const audio = audioRef.current
    if (audio) {
      audio.currentTime = 0
      audio.play().catch(() => {})
    }
  }, [segments, difficulty, allWords, audioRef])

  // ─── Scroll active gap into view ───
  useEffect(() => {
    if (phase === 'playing' && activeGapRef.current) {
      activeGapRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [currentIndex, phase])

  // ─── Auto-pause audio at gap segment end ───
  useEffect(() => {
    if (phase !== 'playing' || gaps.length === 0) return
    const audio = audioRef.current
    if (!audio) return

    const currentGap = gaps[currentIndex]
    if (!currentGap) return

    const gapSegment = segments[currentGap.segmentIndex]
    const pauseAt = gapSegment ? gapSegment.end : currentGap.startTime + 5

    let rafId: number
    const check = () => {
      if (audio.currentTime >= pauseAt && !audio.paused) {
        audio.pause()
      }
      rafId = requestAnimationFrame(check)
    }
    rafId = requestAnimationFrame(check)
    return () => cancelAnimationFrame(rafId)
  }, [phase, gaps, currentIndex, audioRef, segments])

  // ─── Move to next gap (no auto-play) ───
  const moveToNext = useCallback(() => {
    setFeedback(null)
    const nextIndex = currentIndex + 1
    if (nextIndex >= gaps.length) {
      setPhase('results')
      const audio = audioRef.current
      if (audio) audio.pause()
      return
    }

    setCurrentIndex(nextIndex)
    const nextGap = gaps[nextIndex]
    const distractors = generateDistractors(nextGap.word, allWords)
    setOptions(shuffleArray([nextGap.word, ...distractors]))
    // Don't auto-play — user clicks ▶
  }, [currentIndex, gaps, allWords, audioRef])

  // ─── Continue playback (user-initiated) ───
  const continuePlayback = useCallback(() => {
    if (feedback) moveToNext()
    const audio = audioRef.current
    if (audio) audio.play().catch(() => {})
  }, [feedback, moveToNext, audioRef])

  // ─── Jump to next gap (seek directly) ───
  const jumpToNextGap = useCallback(() => {
    if (feedback) moveToNext()
    const idx = feedback ? Math.min(currentIndex + 1, gaps.length - 1) : currentIndex
    const nextGap = gaps[idx]
    if (!nextGap) return
    const audio = audioRef.current
    if (audio) {
      audio.currentTime = Math.max(0, nextGap.startTime - 0.5)
      audio.play().catch(() => {})
    }
  }, [feedback, moveToNext, currentIndex, gaps, audioRef])

  // ─── Handle answer selection ───
  const handleAnswer = useCallback(async (answer: string) => {
    if (feedback) return
    const currentGap = gaps[currentIndex]
    if (!currentGap) return

    const isCorrect = answer.toLowerCase() === currentGap.word.toLowerCase()

    let definition = ''
    if (!isCorrect) {
      const result = await lookupWord(currentGap.word)
      definition = result?.definitions?.join('; ') ?? ''
    }

    setFeedback({ correct: isCorrect, definition })
    setAnswers(prev => [...prev, {
      gap: currentGap,
      userAnswer: answer,
      correct: isCorrect,
      definition,
    }])
    // Don't auto-advance — wait for user to click ▶
  }, [feedback, gaps, currentIndex])

  // ─── Skip current word ───
  const skipWord = useCallback(async () => {
    if (feedback) return
    const currentGap = gaps[currentIndex]
    if (!currentGap) return

    const result = await lookupWord(currentGap.word)
    const definition = result?.definitions?.join('; ') ?? ''

    setFeedback({ correct: false, definition })
    setAnswers(prev => [...prev, {
      gap: currentGap,
      userAnswer: '',
      correct: false,
      definition,
    }])
  }, [feedback, gaps, currentIndex])

  // ─── Global keyboard shortcuts ───
  useEffect(() => {
    if (phase !== 'playing') return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && e.shiftKey) {
        e.preventDefault()
        continuePlayback()
      } else if (e.key === 'Enter' && feedback) {
        e.preventDefault()
        continuePlayback()
      } else if (e.key === 'Enter' && !feedback) {
        e.preventDefault()
        skipWord()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [phase, feedback, continuePlayback, skipWord])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (feedbackTimer.current) clearTimeout(feedbackTimer.current)
    }
  }, [])

  // ─── Results calculations ───
  const correctCount = answers.filter(a => a.correct).length
  const wrongAnswers = answers.filter(a => !a.correct)
  const scorePercent = gaps.length > 0 ? Math.round((correctCount / gaps.length) * 100) : 0

  // ─── Render: Setup screen ───
  if (phase === 'setup') {
    const difficulties: Array<{ key: 'easy' | 'medium' | 'hard'; label: string }> = [
      { key: 'easy', label: t('game.easy') },
      { key: 'medium', label: t('game.medium') },
      { key: 'hard', label: t('game.hard') },
    ]

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {t('game.gapFill')}
          </h3>
          <button
            onClick={onExit}
            className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            {t('game.exit')}
          </button>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('game.difficulty')}</p>
          <div className="flex gap-2">
            {difficulties.map(d => (
              <button
                key={d.key}
                onClick={() => setDifficulty(d.key)}
                className={`flex-1 py-2 rounded-full text-sm font-medium transition-colors ${
                  difficulty === d.key
                    ? 'bg-mode-podcast text-white'
                    : 'bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <div className="text-center py-4">
          <p className="text-3xl font-bold text-mode-podcast">{previewCount}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('game.progress')}</p>
        </div>

        <button
          onClick={startGame}
          disabled={previewCount === 0}
          className="w-full py-3 rounded-xl bg-mode-podcast text-white font-medium text-base hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          {t('game.start')}
        </button>
      </div>
    )
  }

  // ─── Render: Results screen ───
  if (phase === 'results') {
    return (
      <div className="space-y-5">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {t('game.result')}
        </h3>

        <div className="text-center py-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
          <p className="text-4xl font-bold text-mode-podcast">{scorePercent}%</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {t('game.score')}: {correctCount}/{gaps.length}
          </p>
        </div>

        {wrongAnswers.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('game.wrong')} ({wrongAnswers.length})
            </p>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {wrongAnswers.map((a, i) => (
                <div key={i} className="flex items-start gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm">
                  <span className="text-red-500 line-through shrink-0">{a.userAnswer || '—'}</span>
                  <span className="text-gray-400 shrink-0">&rarr;</span>
                  <div className="min-w-0">
                    <span className="text-green-600 dark:text-green-400 font-medium">{a.gap.word}</span>
                    {a.definition && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{a.definition}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2">
          {wrongAnswers.length > 0 && onAddToVocab && (
            <button
              onClick={() => wrongAnswers.forEach(a => onAddToVocab(a.gap.word))}
              className="w-full py-3 rounded-xl bg-mode-podcast/10 text-mode-podcast font-medium text-sm hover:bg-mode-podcast/20 transition-colors"
            >
              {t('game.addWrongWords')}
            </button>
          )}
          <div className="flex gap-2">
            <button
              onClick={() => { setPhase('setup'); setCurrentIndex(0); setAnswers([]) }}
              className="flex-1 py-3 rounded-xl bg-mode-podcast text-white font-medium text-sm hover:opacity-90 transition-opacity"
            >
              {t('game.playAgain')}
            </button>
            <button
              onClick={onExit}
              className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 font-medium text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {t('game.exit')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ─── Render: Playing screen ───
  const currentGap = gaps[currentIndex]

  const gapMap = new Map<number, Set<number>>()
  for (const g of gaps) {
    if (!gapMap.has(g.segmentIndex)) gapMap.set(g.segmentIndex, new Set())
    gapMap.get(g.segmentIndex)!.add(g.wordIndex)
  }

  const answeredGapWords = new Set(answers.map(a => `${a.gap.segmentIndex}-${a.gap.wordIndex}`))

  return (
    <div className="space-y-4">
      {/* Header with progress */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
          {t('game.gapFill')}
        </h3>
        <button
          onClick={onExit}
          className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          {t('game.exit')}
        </button>
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{t('game.progress')}</span>
          <span className="tabular-nums">{currentIndex + 1}/{gaps.length}</span>
        </div>
        <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-mode-podcast rounded-full transition-all duration-300 ease-out"
            style={{ width: `${((currentIndex + 1) / gaps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Transcript with blanks */}
      <div className="max-h-[20rem] overflow-y-auto space-y-1.5 rounded-xl">
        {segments.map((seg, si) => {
          const segGaps = gapMap.get(si)
          if (!segGaps) {
            return (
              <div key={si} className="px-3 py-2 rounded-lg text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                {seg.text}
              </div>
            )
          }

          const words = seg.text.split(/\s+/)
          const isCurrentSegment = currentGap?.segmentIndex === si

          return (
            <div
              key={si}
              className={`px-3 py-2 rounded-lg text-sm leading-relaxed transition-colors ${
                isCurrentSegment
                  ? 'bg-mode-podcast/10 text-gray-900 dark:text-gray-100'
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              {words.map((word, wi) => {
                if (!segGaps.has(wi)) {
                  return <span key={wi}>{wi > 0 ? ' ' : ''}{word}</span>
                }

                const gapKey = `${si}-${wi}`
                const isCurrentGap = currentGap?.segmentIndex === si && currentGap?.wordIndex === wi
                const isAnswered = answeredGapWords.has(gapKey)
                const answerRecord = answers.find(
                  a => a.gap.segmentIndex === si && a.gap.wordIndex === wi
                )

                if (isAnswered && answerRecord) {
                  return (
                    <span key={wi}>
                      {wi > 0 ? ' ' : ''}
                      <span className={`inline-block px-1.5 py-0.5 rounded font-medium ${
                        answerRecord.correct
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                      }`}>
                        {answerRecord.gap.word}
                      </span>
                    </span>
                  )
                }

                return (
                  <span key={wi}>
                    {wi > 0 ? ' ' : ''}
                    <span
                      ref={isCurrentGap ? activeGapRef : undefined}
                      className={`inline-block px-2 py-0.5 rounded border-dashed border-2 min-w-[3rem] text-center ${
                        isCurrentGap
                          ? 'border-mode-podcast bg-mode-podcast/20 animate-pulse'
                          : 'border-gray-300 dark:border-gray-600 bg-gray-100/50 dark:bg-gray-700/30'
                      }`}
                    >
                      {'____'}
                    </span>
                  </span>
                )
              })}
            </div>
          )
        })}
      </div>

      {/* Feedback */}
      {feedback && (
        <div className={`px-4 py-3 rounded-xl text-sm font-medium ${
          feedback.correct
            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
            : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
        }`}>
          <p>{feedback.correct ? t('game.correct') : t('game.wrong')}</p>
          {!feedback.correct && (
            <div className="mt-1">
              <p className="text-green-600 dark:text-green-400">{currentGap?.word}</p>
              {feedback.definition && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{feedback.definition}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Action buttons — shown after answering */}
      {feedback && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const audio = audioRef.current
              if (audio && currentGap) {
                audio.currentTime = Math.max(0, currentGap.startTime - 0.5)
                audio.play().catch(() => {})
              }
            }}
            className="p-3 rounded-xl bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors shrink-0"
            title={t('game.replay')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
            </svg>
          </button>
          <button
            onClick={continuePlayback}
            className="flex-1 py-3 rounded-xl bg-mode-podcast text-white font-medium text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            {t('game.continuePlaying')}
          </button>
          <button
            onClick={jumpToNextGap}
            className="p-3 rounded-xl bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors shrink-0"
            title={t('game.jumpToNext')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061A1.125 1.125 0 0 1 3 16.811V8.69ZM12.75 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061a1.125 1.125 0 0 1-1.683-.977V8.69Z" />
            </svg>
          </button>
        </div>
      )}

      {/* Answer options + skip */}
      {!feedback && (
        <>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const audio = audioRef.current
                if (audio && currentGap) {
                  audio.currentTime = Math.max(0, currentGap.startTime - 0.5)
                  audio.play().catch(() => {})
                }
              }}
              className="p-3 rounded-xl bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors shrink-0"
              title={t('game.replay')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
              </svg>
            </button>
            <div className="flex-1 grid grid-cols-2 gap-2">
              {options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(opt)}
                  className="py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm font-medium hover:border-mode-podcast hover:bg-mode-podcast/5 transition-colors active:scale-95"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Keyboard hints */}
      {phase === 'playing' && (
        <p className="text-[11px] text-gray-400 text-center">
          {feedback
            ? `Enter / Shift+Enter = ${t('game.continuePlaying')}`
            : `Enter = ${t('game.skip')} · Shift+Enter = ${t('game.continuePlaying')}`}
        </p>
      )}
    </div>
  )
}
