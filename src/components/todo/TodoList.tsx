import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { PRIORITY_ORDER } from '../../constants/todo'
import TodoItem from './TodoItem'
import type { TodoItem as TodoItemType } from '../../types/todo'

interface TodoListProps {
  items: TodoItemType[]
  filter: 'all' | 'active' | 'completed'
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onUpdate?: (id: string, updates: Partial<TodoItemType>) => void
}

export default function TodoList({ items, filter, onToggle, onDelete, onUpdate }: TodoListProps) {
  const { t } = useTranslation()

  const filtered = useMemo(() => {
    let list: TodoItemType[]
    if (filter === 'active') list = items.filter(item => !item.done)
    else if (filter === 'completed') list = items.filter(item => item.done)
    else list = [...items]
    return list.sort((a, b) => {
      // Active items first, then by priority, then by creation
      if (a.done !== b.done) return a.done ? 1 : -1
      const pDiff = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
      if (pDiff !== 0) return pDiff
      return b.createdAt.localeCompare(a.createdAt)
    })
  }, [items, filter])

  if (filtered.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-gray-400 dark:text-gray-500">{t('todo.emptyTitle')}</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
      {filtered.map(item => (
        <TodoItem key={item.id} item={item} onToggle={onToggle} onDelete={onDelete} onUpdate={onUpdate} />
      ))}
    </div>
  )
}
