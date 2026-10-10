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

// ─── Stop words: top ~500 most common English words (too easy to test) ───

export const STOP_WORDS = new Set([
  // Function words, pronouns, prepositions, conjunctions, articles
  'the','a','an','and','or','but','if','in','on','at','to','for','of','with',
  'by','from','up','out','about','into','through','during','before','after',
  'above','below','between','under','over','again','further','then','once',
  'here','there','where','when','why','how','what','which','who','whom',
  'this','that','these','those','am','is','are','was','were','be','been',
  'being','have','has','had','having','do','does','did','doing','will',
  'would','shall','should','may','might','must','can','could','need',
  'dare','ought','used','not','no','nor','so','than','too','very','just',
  'also','still','already','yet','even','ever','never','always','often',
  'sometimes','usually','already','almost','enough','quite','rather',
  // Pronouns
  'i','me','my','mine','myself','you','your','yours','yourself','he','him',
  'his','himself','she','her','hers','herself','it','its','itself','we',
  'us','our','ours','ourselves','they','them','their','theirs','themselves',
  // Common verbs (too basic)
  'get','got','gets','getting','go','goes','went','gone','going','come',
  'came','comes','coming','make','made','makes','making','take','took',
  'takes','taking','give','gave','gives','giving','know','knew','knows',
  'knowing','think','thought','thinks','thinking','see','saw','sees',
  'seeing','want','wants','wanted','wanting','look','looked','looks',
  'looking','use','used','uses','using','find','found','finds','tell',
  'told','tells','say','said','says','saying','put','puts','keep','kept',
  'keeps','let','lets','begin','began','run','ran','turn','turned',
  'ask','asked','try','tried','leave','left','call','called','move',
  'moved','live','lived','seem','seemed','feel','felt','set','hold',
  'held','bring','brought','show','showed','start','started','stand',
  'stood','lose','lost','pay','paid','meet','met','play','played',
  'hear','heard','read','help','helped','talk','talked','stop','stopped',
  // Common nouns (too basic)
  'time','year','people','way','day','man','woman','child','world','life',
  'hand','part','place','case','week','point','home','water','room','area',
  'money','story','fact','month','lot','night','thing','name','head','line',
  'city','book','side','house','friend','end','power','hour','game','back',
  'word','body','kind','food','door','face','group','mind','girl','eye',
  'idea','state','work','school','number','country','problem','company',
  // Common adjectives/adverbs (too basic)
  'good','great','big','small','long','old','new','young','little','right',
  'wrong','high','low','large','same','different','last','first','next',
  'early','real','much','many','more','most','few','some','any','every',
  'each','both','all','own','sure','well','hard','fast','best','only',
  'able','free','full','open','late','clear','easy','ready','true','less',
  // Filler words, discourse markers
  'yeah','yes','okay','oh','um','uh','ah','well','like','actually',
  'really','maybe','probably','pretty','stuff','things','something',
  'anything','everything','nothing','someone','anyone','everyone',
])

// ─── Scoring: words in this set get lower priority ───

const COMMON_200 = new Set([...STOP_WORDS])

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
  if (lower.length < 5) return 0

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
      const raw = words[wi].replace(/^[^a-zA-Z']+|[^a-zA-Z']+$/g, '')
      const cleaned = raw.toLowerCase()
      if (!cleaned || cleaned.length < 5) continue

      // Extra safety: skip mid-sentence capitalized words (proper nouns)
      const midCap = wi > 0 && raw[0] === raw[0].toUpperCase() && raw[0] !== raw[0].toLowerCase()
      if (midCap) continue

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
