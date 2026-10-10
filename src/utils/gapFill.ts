import { isKnownWord } from '../api/dictionary'
import type { Segment } from '../types/podcast'

// ─── Types ───

export interface GapWord {
  segmentIndex: number    // which segment this word is in
  wordIndex: number       // position in the segment text
  word: string            // the actual word (cleaned)
  sentence: string        // full segment text
  startTime: number       // segment start time for audio
}

export interface GapOptions {
  difficulty: 'easy' | 'medium' | 'hard'
  count?: number           // optional override for number of gaps
}

// ─── Stop words (~120 most common English function words) ───

const STOP_WORDS = new Set([
  'the','be','to','of','and','a','in','that','have','i','it','for','not','on',
  'with','he','as','you','do','at','this','but','his','by','from','they','we',
  'her','she','or','an','will','my','one','all','would','there','their','what',
  'so','up','out','if','about','who','get','which','go','me','when','make',
  'can','like','time','no','just','him','know','take','people','into','year',
  'your','good','some','could','them','see','other','than','then','now','look',
  'only','come','its','over','think','also','back','after','use','two','how',
  'our','way','even','new','want','because','any','these','give','day','most',
  'us','is','are','was','were','been','being','has','had','did','does','doing',
  'am','very','much','more','many','such','own','same','here','too','well',
  'really','still','should','may','might','must','shall','let','got','say',
  'said','tell','told','ask','asked','need','seem','feel','keep','put','run',
  'turn','yet','off','went','gone','been','done','made',
])

// ─── Top-200 common words (superset of stop words for frequency scoring) ───

const COMMON_200 = new Set([
  ...STOP_WORDS,
  'thing','man','woman','child','world','life','hand','part','place','case',
  'week','company','system','program','question','work','government','number',
  'night','point','home','water','room','mother','area','money','story','fact',
  'month','lot','right','big','high','small','large','long','great','old',
  'little','different','young','important','few','public','bad','same','last',
  'first','next','early','begin','start','end','call','try','each','every',
  'both','while','through','before','between','under','never','always',
  'often','around','another','still','before','find',
])

// ─── Fallback distractors (common nouns/verbs for padding) ───

const FALLBACK_WORDS = [
  'moment','actually','probably','certainly','information','experience',
  'understand','important','different','something','everything','beautiful',
  'yesterday','community','education','beginning','attention','certainly',
  'direction','situation','knowledge','challenge','wonderful','sometimes',
  'continue','remember','consider','together','question','practice',
  'building','complete','possible','research','business','decision',
  'position','interest','national','personal','language','provide',
  'political','economic','increase','physical','evidence','original',
  'military','standard','industry','material',
]

// ─── Utility: clean a word token ───

function cleanWord(token: string): string {
  return token.replace(/^[^a-zA-Z']+|[^a-zA-Z']+$/g, '').toLowerCase()
}

// ─── Score a word for "gap worthiness" ───

function scoreWord(word: string): number {
  const lower = word.toLowerCase()
  if (STOP_WORDS.has(lower)) return 0
  if (lower.length < 3) return 0

  let score = lower.length * 2
  // Content word bonus (not in common-200)
  if (!COMMON_200.has(lower)) score += 5
  // Longer words are more interesting
  if (lower.length >= 6) score += 3
  if (lower.length >= 8) score += 2
  // Small random factor for variety
  score += Math.random() * 3

  return score
}

// ─── Main: generate gap words from segments ───

export async function generateGaps(segments: Segment[], options: GapOptions): Promise<GapWord[]> {
  const { difficulty, count } = options

  const fractionMap = { easy: 0.2, medium: 0.33, hard: 0.5 }
  const fraction = fractionMap[difficulty]

  const spacingMap = { easy: 2, medium: 1, hard: 0 }
  const minSpacing = spacingMap[difficulty]

  // Collect all candidate words with scores
  const rawCandidates: (GapWord & { score: number })[] = []

  for (let si = 0; si < segments.length; si++) {
    const seg = segments[si]
    const words = seg.text.split(/\s+/)

    for (let wi = 0; wi < words.length; wi++) {
      const cleaned = cleanWord(words[wi])
      if (!cleaned || cleaned.length < 4) continue

      const score = scoreWord(cleaned)
      if (score <= 0) continue

      rawCandidates.push({
        segmentIndex: si,
        wordIndex: wi,
        word: cleaned,
        sentence: seg.text,
        startTime: seg.start,
        score,
      })
    }
  }

  // Filter: only keep words that exist in the offline dictionary
  // (this removes proper nouns, names, places, made-up words)
  const dictChecks = await Promise.all(rawCandidates.map(c => isKnownWord(c.word)))
  const candidates = rawCandidates.filter((_, i) => dictChecks[i])

  // Sort by score descending
  candidates.sort((a, b) => b.score - a.score)

  // Determine target count
  const targetCount = count ?? Math.max(3, Math.round(segments.length * fraction))

  // Pick top candidates with spacing constraint
  const picked: GapWord[] = []
  const usedSegments = new Set<number>()

  for (const c of candidates) {
    if (picked.length >= targetCount) break

    // Check spacing
    let tooClose = false
    for (const si of usedSegments) {
      if (Math.abs(c.segmentIndex - si) <= minSpacing) {
        // For hard difficulty (spacing=0), allow multiple per segment but not same word
        if (minSpacing === 0) continue
        tooClose = true
        break
      }
    }
    if (tooClose) continue

    // Avoid duplicate words
    if (picked.some(p => p.word === c.word)) continue

    picked.push({
      segmentIndex: c.segmentIndex,
      wordIndex: c.wordIndex,
      word: c.word,
      sentence: c.sentence,
      startTime: c.startTime,
    })
    usedSegments.add(c.segmentIndex)
  }

  // Sort by segment order for sequential play
  picked.sort((a, b) => a.segmentIndex - b.segmentIndex || a.wordIndex - b.wordIndex)

  return picked
}

// ─── Generate distractors for multiple choice ───

export function generateDistractors(word: string, allWords: string[]): string[] {
  const lower = word.toLowerCase()
  const targetLen = lower.length

  // Collect unique candidate distractors from transcript words
  const candidates = new Set<string>()
  for (const w of allWords) {
    const cleaned = cleanWord(w)
    if (!cleaned) continue
    if (cleaned === lower) continue
    if (cleaned.length < 3) continue
    // Similar length (+-2 chars)
    if (Math.abs(cleaned.length - targetLen) <= 2) {
      candidates.add(cleaned)
    }
  }

  // If not enough from transcript, pad from fallback list
  if (candidates.size < 3) {
    for (const fb of FALLBACK_WORDS) {
      if (fb === lower) continue
      if (Math.abs(fb.length - targetLen) <= 3) {
        candidates.add(fb)
      }
      if (candidates.size >= 10) break
    }
  }

  // Shuffle and pick 3
  const arr = [...candidates]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }

  return arr.slice(0, 3)
}

// ─── Shuffle an array (Fisher-Yates) ───

export function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

// ─── Collect all words from segments ───

export function collectAllWords(segments: Segment[]): string[] {
  const words: string[] = []
  for (const seg of segments) {
    for (const token of seg.text.split(/\s+/)) {
      const cleaned = cleanWord(token)
      if (cleaned && cleaned.length >= 3) words.push(cleaned)
    }
  }
  return words
}
