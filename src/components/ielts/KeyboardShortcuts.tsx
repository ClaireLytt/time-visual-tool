/* ─── IELTS — Keyboard Shortcuts ─── */

import { useEffect, useState } from 'react'

const SHORTCUTS = [
  { keys: 'Space', desc: '开始/暂停计时（记录页）' },
  { keys: 'N', desc: '打开新建记录表单' },
  { keys: '⌘/Ctrl + K', desc: '聚焦搜索框' },
  { keys: '?', desc: '显示/隐藏快捷键' },
]

export function useIeltsShortcuts() {
  const [showHelp, setShowHelp] = useState(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Skip if typing in input/textarea
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      if (e.key === '?') {
        e.preventDefault()
        setShowHelp(prev => !prev)
        return
      }

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault()
        // Click the "+ 记录练习" CollapsibleForm button
        const btn = document.querySelector('[data-shortcut="new-record"]') as HTMLButtonElement
        btn?.click()
        return
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        const input = document.querySelector('[data-shortcut="search"]') as HTMLInputElement
        input?.focus()
        return
      }

      if (e.key === ' ') {
        // Space for timer — only if timer exists on page
        const timerBtn = document.querySelector('[data-shortcut="timer"]') as HTMLButtonElement
        if (timerBtn) {
          e.preventDefault()
          timerBtn.click()
        }
      }
    }

    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  return { showHelp, setShowHelp }
}

export function ShortcutHelpOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-50" onClick={onClose} />
      <div className="fixed bottom-4 right-4 z-50 bg-white dark:bg-gray-800 rounded-2xl shadow-xl
        border border-gray-200 dark:border-gray-700 p-4 w-72">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">⌨️ 快捷键</p>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xs">✕</button>
        </div>
        <div className="space-y-2">
          {SHORTCUTS.map(s => (
            <div key={s.keys} className="flex items-center justify-between">
              <span className="text-xs text-gray-500">{s.desc}</span>
              <kbd className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-xs font-mono
                text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                {s.keys}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
