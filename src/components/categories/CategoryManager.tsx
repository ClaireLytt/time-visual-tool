import { useState } from 'react'
import type { TimeEntry, Category } from '../../types'
import ConfirmDialog from '../common/ConfirmDialog'

interface CategoryManagerProps {
  categories: Category[]
  entries: TimeEntry[]
  onAdd: (category: Category) => void
  onUpdate: (oldName: string, updated: Category) => void
  onDelete: (name: string) => void
}

function CategoryManager({ categories, entries, onAdd, onUpdate, onDelete }: CategoryManagerProps) {
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState('#6366f1')
  const [editingName, setEditingName] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const handleAdd = () => {
    const name = newName.trim()
    if (!name) return
    if (categories.some(c => c.name === name)) return
    onAdd({ name, color: newColor })
    setNewName('')
    setNewColor('#6366f1')
  }

  const startEdit = (cat: Category) => {
    setEditingName(cat.name)
    setEditName(cat.name)
    setEditColor(cat.color)
  }

  const saveEdit = () => {
    if (!editingName) return
    const name = editName.trim()
    if (!name) return
    if (name !== editingName && categories.some(c => c.name === name)) return
    onUpdate(editingName, { name, color: editColor })
    setEditingName(null)
  }

  const isUsed = (name: string) => entries.some(e => e.category === name)

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">分类管理</h3>

      <div className="space-y-2 mb-3">
        {categories.map(cat => (
          <div key={cat.name} className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-gray-50 group">
            {editingName === cat.name ? (
              <>
                <input
                  type="color"
                  value={editColor}
                  onChange={e => setEditColor(e.target.value)}
                  className="w-6 h-6 rounded cursor-pointer border-0 p-0"
                />
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveEdit()}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <button onClick={saveEdit} className="text-xs text-blue-600 hover:text-blue-700 font-medium">保存</button>
                <button onClick={() => setEditingName(null)} className="text-xs text-gray-500 hover:text-gray-600">取消</button>
              </>
            ) : (
              <>
                <span className="w-4 h-4 rounded-sm shrink-0" style={{ backgroundColor: cat.color }} />
                <span className="flex-1 text-sm text-gray-700">{cat.name}</span>
                <button
                  onClick={() => startEdit(cat)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-blue-500 transition-all"
                  title="编辑"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button
                  onClick={() => !isUsed(cat.name) && setDeleteTarget(cat.name)}
                  disabled={isUsed(cat.name)}
                  className={`opacity-0 group-hover:opacity-100 p-1 transition-all ${isUsed(cat.name) ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-red-500'}`}
                  title={isUsed(cat.name) ? '有记录使用此分类' : '删除'}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
        <input
          type="color"
          value={newColor}
          onChange={e => setNewColor(e.target.value)}
          className="w-6 h-6 rounded cursor-pointer border-0 p-0"
        />
        <input
          type="text"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder="新分类名称"
          className="flex-1 px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          maxLength={20}
        />
        <button
          onClick={handleAdd}
          disabled={!newName.trim()}
          className="px-3 py-1.5 bg-blue-500 text-white text-xs font-medium rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          添加
        </button>
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="确认删除分类"
        message={`确定要删除分类「${deleteTarget}」吗？`}
        confirmLabel="删除"
        confirmVariant="danger"
        onConfirm={() => { if (deleteTarget) onDelete(deleteTarget); setDeleteTarget(null) }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

export default CategoryManager
