import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { TimeEntry, Category } from '../../types'
import { EditIcon, XIcon } from '../icons'
import ConfirmDialog from '../common/ConfirmDialog'

interface CategoryManagerProps {
  categories: Category[]
  entries: TimeEntry[]
  onAdd: (category: Category) => void
  onUpdate: (oldName: string, updated: Category) => void
  onDelete: (name: string) => void
}

function CategoryManager({ categories, entries, onAdd, onUpdate, onDelete }: CategoryManagerProps) {
  const { t } = useTranslation()
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
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">{t('category.title')}</h3>

      <div className="space-y-2 mb-3">
        {categories.map(cat => (
          <div key={cat.name} className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 group">
            {editingName === cat.name ? (
              <div className="flex items-center gap-2 flex-wrap flex-1">
                <input
                  type="color"
                  value={editColor}
                  onChange={e => setEditColor(e.target.value)}
                  className="w-6 h-6 rounded cursor-pointer border-0 p-0"
                  aria-label={t('category.colorLabel')}
                />
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveEdit()}
                  className="input-base flex-1 min-w-0 !px-2 !py-1 !rounded"
                  aria-label={t('category.nameLabel')}
                  autoFocus
                />
                <button onClick={saveEdit} className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">{t('category.saveButton')}</button>
                <button onClick={() => setEditingName(null)} className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">{t('category.cancelButton')}</button>
              </div>
            ) : (
              <>
                <span className="w-4 h-4 rounded-sm shrink-0" style={{ backgroundColor: cat.color }} aria-hidden="true" />
                <span className="flex-1 text-sm text-gray-700 dark:text-gray-200">{cat.name}</span>
                <button
                  onClick={() => startEdit(cat)}
                  className="opacity-70 hover:opacity-100 focus-visible:opacity-100 p-1 text-gray-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 transition-all"
                  aria-label={t('category.editAriaLabel', { name: cat.name })}
                >
                  <EditIcon className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => !isUsed(cat.name) && setDeleteTarget(cat.name)}
                  disabled={isUsed(cat.name)}
                  className={`opacity-70 hover:opacity-100 focus-visible:opacity-100 p-1 transition-all ${isUsed(cat.name) ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400'}`}
                  aria-label={isUsed(cat.name) ? t('category.deleteDisabledAriaLabel', { name: cat.name }) : t('category.deleteAriaLabel', { name: cat.name })}
                >
                  <XIcon className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
        <input
          type="color"
          value={newColor}
          onChange={e => setNewColor(e.target.value)}
          className="w-6 h-6 rounded cursor-pointer border-0 p-0"
          aria-label={t('category.newColorLabel')}
        />
        <input
          type="text"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder={t('category.newNamePlaceholder')}
          aria-label={t('category.newNameLabel')}
          className="input-base flex-1 !px-2 !py-1.5"
          maxLength={20}
        />
        <button
          onClick={handleAdd}
          disabled={!newName.trim()}
          className="px-3 py-1.5 bg-blue-500 text-white text-xs font-medium rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t('category.addButton')}
        </button>
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        title={t('category.deleteConfirmTitle')}
        message={t('category.deleteConfirmMessage', { name: deleteTarget })}
        confirmLabel={t('delete.deleteButton')}
        confirmVariant="danger"
        onConfirm={() => { if (deleteTarget) onDelete(deleteTarget); setDeleteTarget(null) }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

export default CategoryManager
