import { memo, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { lookupWord, playPronunciation, type DictResult } from '../../api/dictionary'

interface WordPopoverProps {
  word: string
  anchorRect: DOMRect
  onClose: () => void
  onLookup?: (word: string) => void
  onAddToVocab?: (word: string) => void
  onSaveSentence?: () => void
  isSentenceSaved?: boolean
  /** The full sentence containing this word (for AI context) */
  sentenceContext?: string
}

function cleanWord(raw: string): string {
  return raw.replace(/^[^a-zA-Z']+|[^a-zA-Z']+$/g, '').toLowerCase()
}

const GAP = 8

function computePosition(anchor: DOMRect) {
  const vw = window.innerWidth
  const vh = window.innerHeight
  // Responsive width: shrink on small screens, cap at 340
  const popoverW = Math.min(340, vw - 24)
  const clampTop = (t: number) => Math.max(8, Math.min(t, vh - 300))

  // Try right side
  if (anchor.right + GAP + popoverW + 12 < vw)
    return { top: clampTop(anchor.top), left: anchor.right + GAP, w: popoverW, ox: '0% 0%' }
  // Try left side
  if (anchor.left - GAP - popoverW > 12)
    return { top: clampTop(anchor.top), left: anchor.left - GAP - popoverW, w: popoverW, ox: '100% 0%' }
  // Fall back to centered above/below
  const cx = Math.max(12, Math.min(anchor.left + anchor.width / 2 - popoverW / 2, vw - popoverW - 12))
  const below = vh - anchor.bottom > 200
  return { top: below ? anchor.bottom + GAP : anchor.top - GAP, left: cx, w: popoverW, ox: below ? '50% 0%' : '50% 100%' }
}

export default memo(function WordPopover({
  word, anchorRect, onClose, onLookup, onAddToVocab, onSaveSentence, isSentenceSaved, sentenceContext,
}: WordPopoverProps) {
  const { t } = useTranslation()
  const [data, setData] = useState<DictResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [added, setAdded] = useState(false)
  const onLookupRef = useRef(onLookup)
  onLookupRef.current = onLookup

  const pos = computePosition(anchorRect)
  const cleanedWord = cleanWord(word)

  useEffect(() => {
    if (!cleanedWord) { setLoading(false); return }
    const ctrl = new AbortController()
    setLoading(true)
    setAdded(false)
    lookupWord(cleanedWord, ctrl.signal).then(result => {
      if (!ctrl.signal.aborted) {
        setData(result)
        setLoading(false)
        if (result) {
          onLookupRef.current?.(cleanedWord)
          // Auto-play pronunciation on lookup success
          const audioUrl = result.phonetics.us.audio || result.phonetics.uk.audio
          playPronunciation(audioUrl, cleanedWord)
        }
      }
    })
    return () => ctrl.abort()
  }, [cleanedWord])

  // Only allow navigation to known, trusted domains
  const ALLOWED_HOSTS = ['www.google.com', 'www.merriam-webster.com', 'dict.youdao.com']
  const menuItems = [
    { label: t('podcast.dictAiExplain'), href: `https://www.google.com/search?q=${encodeURIComponent(`"${cleanedWord}" meaning in "${sentenceContext ?? ''}" explain in Chinese`)}`,
      icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" />,
    },
    { label: t('podcast.dictEnDef'), href: `https://www.merriam-webster.com/dictionary/${encodeURIComponent(cleanedWord)}`,
      icon: <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />,
    },
    { label: t('podcast.dictWebDict'), href: `https://dict.youdao.com/result?word=${encodeURIComponent(cleanedWord)}&lang=en`,
      icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5a17.92 17.92 0 0 1-8.716-2.247m0 0A8.966 8.966 0 0 1 3 12c0-1.264.26-2.467.732-3.558" />,
    },
  ].filter(item => {
    // Validate each href is a safe HTTPS URL on a known host
    try {
      const url = new URL(item.href)
      return url.protocol === 'https:' && ALLOWED_HOSTS.includes(url.hostname)
    } catch { return false }
  })

  return (
    <motion.div
      data-word-popover
      onClick={(e) => e.stopPropagation()}
      className="fixed z-50"
      style={{ top: pos.top, left: pos.left, width: pos.w }}
      initial={{ opacity: 0, scale: 0.92, transformOrigin: pos.ox }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-dialog overflow-hidden border border-gray-100 dark:border-gray-700">
        {/* ① Header: word + close */}
        <div className="flex items-center justify-between px-4 pt-3.5 pb-1">
          <span className="text-[17px] font-semibold text-gray-900 dark:text-gray-100">{cleanedWord}</span>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-0.5 -mr-1" aria-label="close">
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>
        </div>

        {/* ② Chinese definitions — TOP PRIORITY, always first */}
        <div className="px-4 py-2 max-h-28 overflow-y-auto">
          {loading && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <div className="w-3.5 h-3.5 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
              {t('podcast.dictLoading')}
            </div>
          )}
          {!loading && data && data.definitions.length > 0 && (
            <div className="space-y-0.5">
              {data.definitions.map((def, i) => (
                <p key={i} className="text-[13px] text-gray-700 dark:text-gray-200 leading-relaxed">
                  <span className="font-medium text-mode-podcast">{def.split(/\s/).shift()}</span>
                  {' '}{def.split(/\s/).slice(1).join(' ')}
                </p>
              ))}
            </div>
          )}
          {!loading && (!data || data.definitions.length === 0) && (
            <p className="text-sm text-gray-400">{t('podcast.dictNoResult')}</p>
          )}
        </div>

        {/* ③ Phonetics — always show pronunciation buttons (Youdao fallback) */}
        {data && (
          <div className="flex items-center gap-3 px-4 py-1.5 text-[12px] text-gray-400 dark:text-gray-500 border-t border-gray-50 dark:border-gray-700/50">
            <button onClick={() => playPronunciation(data.phonetics.uk.audio, cleanedWord)} className="flex items-center gap-1 hover:text-mode-podcast transition-colors">
              <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 8.5v7a4.49 4.49 0 0 0 2.5-3.5z" /></svg>
              <span>{t('podcast.dictUkPron')}{data.phonetics.uk.text && <span className="font-mono ml-1">{data.phonetics.uk.text}</span>}</span>
            </button>
            <button onClick={() => playPronunciation(data.phonetics.us.audio, cleanedWord)} className="flex items-center gap-1 hover:text-mode-podcast transition-colors">
              <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 8.5v7a4.49 4.49 0 0 0 2.5-3.5z" /></svg>
              <span>{t('podcast.dictUsPron')}{data.phonetics.us.text && <span className="font-mono ml-1">{data.phonetics.us.text}</span>}</span>
            </button>
          </div>
        )}

        {/* ④ English definitions (collapsed, secondary) */}
        {!loading && data?.enDefinitions && data.enDefinitions.length > 0 && (
          <div className="px-4 py-1.5 border-t border-gray-50 dark:border-gray-700/50 max-h-20 overflow-y-auto">
            {data.enDefinitions.map((def, i) => (
              <p key={i} className="text-[11px] text-gray-400 dark:text-gray-500 leading-relaxed">
                {def}
              </p>
            ))}
          </div>
        )}

        {/* ⑤ Menu links */}
        <div className="border-t border-gray-100 dark:border-gray-700">
          {menuItems.map((item, i) => (
            <a key={i} href={item.href} target="_blank" rel="noopener noreferrer"
              className={`flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${i < menuItems.length - 1 ? 'border-b border-gray-50 dark:border-gray-700/50' : ''}`}
            >
              <svg className="w-[18px] h-[18px] text-gray-400 dark:text-gray-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>{item.icon}</svg>
              <span>{item.label}</span>
            </a>
          ))}
        </div>

        {/* ⑥ Quick action buttons */}
        <div className="border-t border-gray-100 dark:border-gray-700 flex">
          <button
            onClick={() => { onAddToVocab?.(cleanedWord); setAdded(true) }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-colors rounded-bl-2xl ${
              added ? 'text-green-500 bg-green-50 dark:bg-green-900/20' : 'text-mode-podcast hover:bg-mode-podcast/5'
            }`}
          >
            {added ? (
              <><svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" /></svg>{t('podcast.wordAdded')}</>
            ) : (
              <><svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" /></svg>{t('podcast.addToVocab')}</>
            )}
          </button>
          <div className="w-px bg-gray-100 dark:bg-gray-700" />
          <button
            onClick={onSaveSentence}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-colors rounded-br-2xl ${
              isSentenceSaved ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
            }`}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} fill={isSentenceSaved ? 'currentColor' : 'none'}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
            </svg>
            {isSentenceSaved ? t('podcast.sentenceSaved') : t('podcast.saveSentence')}
          </button>
        </div>
      </div>
    </motion.div>
  )
})
