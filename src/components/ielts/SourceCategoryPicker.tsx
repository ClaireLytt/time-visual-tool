/* ─── IELTS — Source Category Picker + Manager ───
 *
 * Self-contained: no imports from outside src/components/ielts/.
 * Manages source categories (add/rename/delete) with inline editing.
 */

import { useState } from 'react'
import type { IeltsSubject, IeltsSourceCategory } from './types'

interface PickerProps {
  categories: IeltsSourceCategory[]
  subject: IeltsSubject
  selectedId: string
  detail: string
  onSelect: (id: string) => void
  onDetailChange: (detail: string) => void
  onAdd: (cat: IeltsSourceCategory) => void
  onUpdate: (id: string, patch: Partial<IeltsSourceCategory>) => void
  onDelete: (id: string) => void
}

export default function SourceCategoryPicker({
  categories, subject, selectedId, detail,
  onSelect, onDetailChange, onAdd, onUpdate, onDelete,
}: PickerProps) {
  const [showManager, setShowManager] = useState(false)

  // Filter categories by subject (empty subjects array = all subjects)
  const visible = categories.filter(
    c => c.subjects.length === 0 || c.subjects.includes(subject),
  )

  const selected = categories.find(c => c.id === selectedId)

  return (
    <div className="space-y-2">
      {/* Category tags row */}
      <div className="flex flex-wrap gap-2 items-center">
        {visible.map(cat => {
          const active = selectedId === cat.id
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelect(cat.id)}
              className={`h-10 px-4 rounded-lg text-sm font-medium transition-all select-none no-press active:scale-[0.97] ${
                active
                  ? 'bg-[#c0392b] text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-700/50 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {cat.name}
            </button>
          )
        })}
        <button
          type="button"
          onClick={() => setShowManager(!showManager)}
          className="h-10 px-3 rounded-lg text-sm text-gray-400 hover:text-gray-600
            hover:bg-gray-100 dark:hover:bg-gray-700/40 transition-colors no-press"
        >
          {showManager ? '✕ 关闭' : '+ 管理分类'}
        </button>
      </div>

      {/* Detail input — shown when a category is selected */}
      {selected && (
        <input
          value={detail}
          onChange={e => onDetailChange(e.target.value)}
          placeholder={selected.placeholder || '具体内容（选填）'}
          className="input-base w-full rounded-lg text-sm h-11"
        />
      )}

      {/* Inline category manager */}
      {showManager && (
        <CategoryManagerInline
          categories={categories}
          onAdd={onAdd}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onClose={() => setShowManager(false)}
        />
      )}
    </div>
  )
}

/* ── Inline category manager (add / rename / delete) ── */

function CategoryManagerInline({
  categories, onAdd, onUpdate, onDelete, onClose,
}: {
  categories: IeltsSourceCategory[]
  onAdd: (cat: IeltsSourceCategory) => void
  onUpdate: (id: string, patch: Partial<IeltsSourceCategory>) => void
  onDelete: (id: string) => void
  onClose: () => void
}) {
  const [newName, setNewName] = useState('')
  const [newPlaceholder, setNewPlaceholder] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editPlaceholder, setEditPlaceholder] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const handleAdd = () => {
    const name = newName.trim()
    if (!name || categories.some(c => c.name === name)) return
    onAdd({
      id: crypto.randomUUID(),
      name,
      placeholder: newPlaceholder.trim() || '具体内容（选填）',
      subjects: [],
      builtIn: false,
    })
    setNewName('')
    setNewPlaceholder('')
  }

  const startEdit = (cat: IeltsSourceCategory) => {
    setEditingId(cat.id)
    setEditName(cat.name)
    setEditPlaceholder(cat.placeholder)
  }

  const saveEdit = () => {
    if (!editingId || !editName.trim()) return
    onUpdate(editingId, {
      name: editName.trim(),
      placeholder: editPlaceholder.trim() || '具体内容（选填）',
    })
    setEditingId(null)
  }

  return (
    <div className="p-3 bg-gray-50 dark:bg-gray-800/40 rounded-lg space-y-3 text-sm">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-gray-700 dark:text-gray-300">管理来源分类</span>
        <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 no-press">✕</button>
      </div>

      {/* Existing categories */}
      <div className="space-y-2">
        {categories.map(cat => (
          <div key={cat.id}>
            {editingId === cat.id ? (
              /* Editing mode */
              <div className="flex flex-wrap gap-2 items-center">
                <input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="input-base rounded-lg text-sm h-9 flex-1"
                  style={{ minWidth: 80 }}
                  placeholder="分类名"
                />
                <input
                  value={editPlaceholder}
                  onChange={e => setEditPlaceholder(e.target.value)}
                  className="input-base rounded-lg text-sm h-9 flex-[2]"
                  style={{ minWidth: 120 }}
                  placeholder="输入框提示文字"
                />
                <button type="button" onClick={saveEdit}
                  className="h-9 px-3 rounded-lg text-xs font-medium bg-[#c0392b] text-white no-press">
                  保存
                </button>
                <button type="button" onClick={() => setEditingId(null)}
                  className="h-9 px-3 rounded-lg text-xs text-gray-400 hover:text-gray-600 no-press">
                  取消
                </button>
              </div>
            ) : (
              /* Display mode */
              <div className="flex items-center gap-2">
                <span className="text-gray-700 dark:text-gray-300 flex-1 font-medium">
                  {cat.name}
                  {cat.builtIn && <span className="text-[10px] text-gray-400 ml-1">内置</span>}
                </span>
                <span className="text-xs text-gray-400 truncate max-w-[160px]">
                  {cat.placeholder}
                </span>
                <button type="button" onClick={() => startEdit(cat)}
                  className="h-8 w-8 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-200/50 dark:hover:bg-gray-700/40 inline-flex items-center justify-center no-press">
                  ✎
                </button>
                {!cat.builtIn && (
                  confirmDeleteId === cat.id ? (
                    <div className="flex gap-1">
                      <button type="button" onClick={() => { onDelete(cat.id); setConfirmDeleteId(null) }}
                        className="h-8 px-2 rounded-lg text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 no-press">
                        确认删除
                      </button>
                      <button type="button" onClick={() => setConfirmDeleteId(null)}
                        className="h-8 px-2 rounded-lg text-xs text-gray-400 no-press">
                        取消
                      </button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => setConfirmDeleteId(cat.id)}
                      className="h-8 w-8 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50/50 dark:hover:bg-red-900/20 inline-flex items-center justify-center no-press">
                      ✕
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add new */}
      <div className="flex flex-wrap gap-2 items-center pt-2 border-t border-gray-200 dark:border-gray-700/50">
        <input
          value={newName}
          onChange={e => setNewName(e.target.value)}
          placeholder="新分类名称"
          className="input-base rounded-lg text-sm h-9 flex-1"
          style={{ minWidth: 80 }}
        />
        <input
          value={newPlaceholder}
          onChange={e => setNewPlaceholder(e.target.value)}
          placeholder="输入框提示文字（选填）"
          className="input-base rounded-lg text-sm h-9 flex-[2]"
          style={{ minWidth: 120 }}
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!newName.trim()}
          className="h-9 px-4 rounded-lg text-xs font-medium bg-[#c0392b] text-white no-press disabled:opacity-30"
        >
          添加
        </button>
      </div>
    </div>
  )
}
