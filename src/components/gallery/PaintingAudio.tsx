import { useCallback, useRef } from 'react'

/* ═══════════════════════════════════════════
   Painting music — Web Audio API synthesis
   Each painting has a unique short melody
   ═══════════════════════════════════════════ */

// Melodies: arrays of [frequency, duration_ms, delay_ms]
const MELODIES: Record<string, [number, number, number][]> = {
  // Starry Night — dreamy Debussy-like whole tones
  'starry-night': [[330, 600, 0], [370, 600, 500], [415, 800, 1000], [466, 600, 1700], [523, 1200, 2200]],
  // Girl with Pearl — gentle, intimate
  'girl-pearl': [[392, 500, 0], [440, 500, 400], [494, 700, 800], [440, 500, 1400], [392, 900, 1800]],
  // Night Watch — dramatic, bold
  'night-watch': [[196, 400, 0], [220, 400, 300], [262, 600, 600], [196, 300, 1100], [165, 800, 1300]],
  // Water Lilies — flowing, soft
  'water-lilies': [[523, 400, 0], [587, 400, 350], [659, 500, 700], [587, 400, 1100], [523, 400, 1400], [494, 700, 1700]],
  // Mona Lisa — mysterious, slow
  'mona-lisa': [[330, 800, 0], [311, 800, 700], [294, 600, 1400], [330, 1000, 1900]],
  // Guernica — dissonant, tense
  'guernica': [[165, 300, 0], [175, 300, 200], [185, 300, 400], [165, 400, 600], [156, 600, 900]],
  // Great Wave — pentatonic, Japanese
  'great-wave': [[392, 400, 0], [440, 300, 350], [523, 500, 600], [587, 300, 1000], [523, 400, 1250], [440, 600, 1600]],
  // Impression Sunrise — warm, hazy
  'impression-sunrise': [[349, 500, 0], [392, 500, 450], [440, 700, 900], [392, 500, 1500], [349, 800, 1900]],
  // Birth of Venus — graceful, ascending
  'birth-venus': [[262, 400, 0], [294, 400, 350], [330, 400, 700], [392, 500, 1050], [440, 700, 1500]],
  // Creation of Adam — majestic, organ-like
  'creation-adam': [[196, 600, 0], [262, 600, 500], [330, 800, 1000], [392, 1000, 1700]],
  // Composition II — geometric, rhythmic
  'composition-ii': [[440, 200, 0], [440, 200, 250], [523, 200, 500], [523, 200, 750], [659, 400, 1000]],
  // Milkmaid — domestic, warm
  'milkmaid': [[349, 400, 0], [330, 400, 350], [294, 500, 700], [330, 400, 1100], [349, 600, 1450]],
  // Persistence of Memory — surreal, bending
  'persistence-memory': [[440, 500, 0], [415, 600, 400], [392, 700, 900], [370, 800, 1500]],
  // Shrimp — playful, light
  'shrimp': [[523, 200, 0], [587, 200, 200], [659, 200, 400], [587, 200, 600], [523, 300, 800], [494, 400, 1050]],
  // Mount Emei — contemplative, sparse
  'erta-mountain': [[262, 800, 0], [294, 600, 800], [262, 500, 1400], [220, 1000, 1800]],
}

export function usePaintingAudio() {
  const ctxRef = useRef<AudioContext | null>(null)
  const playingRef = useRef(false)

  const play = useCallback((paintingId: string) => {
    const melody = MELODIES[paintingId]
    if (!melody || playingRef.current) return

    try {
      const ctx = new AudioContext()
      ctxRef.current = ctx
      playingRef.current = true

      melody.forEach(([freq, dur, delay]) => {
        const osc = ctx.createOscillator()
        osc.type = 'sine'
        osc.frequency.value = freq

        const gain = ctx.createGain()
        const startTime = ctx.currentTime + delay / 1000
        const endTime = startTime + dur / 1000

        gain.gain.setValueAtTime(0, startTime)
        gain.gain.linearRampToValueAtTime(0.08, startTime + 0.05)
        gain.gain.setValueAtTime(0.08, endTime - 0.1)
        gain.gain.linearRampToValueAtTime(0, endTime)

        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(startTime)
        osc.stop(endTime + 0.01)
      })

      // Cleanup after melody ends
      const totalDur = Math.max(...melody.map(([, d, dl]) => d + dl))
      setTimeout(() => {
        try { ctx.close() } catch { /* */ }
        playingRef.current = false
      }, totalDur + 500)
    } catch {
      playingRef.current = false
    }
  }, [])

  const stop = useCallback(() => {
    if (ctxRef.current) {
      try { ctxRef.current.close() } catch { /* */ }
      ctxRef.current = null
    }
    playingRef.current = false
  }, [])

  return { play, stop }
}

/* ═══════════════════════════════════════════
   Voice narration — Web Speech API
   ═══════════════════════════════════════════ */
export function useVoiceNarration() {
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null)

  const speak = useCallback((text: string, lang: string) => {
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = lang === 'zh' ? 'zh-CN' : 'en-US'
    utter.rate = 0.9
    utter.pitch = 1
    utterRef.current = utter
    window.speechSynthesis.speak(utter)
  }, [])

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel()
  }, [])

  return { speak, stop }
}
