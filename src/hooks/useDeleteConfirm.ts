import { useState, useCallback } from 'react'

/**
 * Shared hook for the delete-confirm pattern used across all entry items.
 * Eliminates repeated useState + ConfirmDialog wiring in every *Item component.
 */
export function useDeleteConfirm(onDelete: (id: string) => void) {
  const [pendingId, setPendingId] = useState<string | null>(null)

  const requestDelete = useCallback((id: string) => {
    setPendingId(id)
  }, [])

  const confirmDelete = useCallback(() => {
    if (pendingId) {
      onDelete(pendingId)
      setPendingId(null)
    }
  }, [pendingId, onDelete])

  const cancelDelete = useCallback(() => {
    setPendingId(null)
  }, [])

  return {
    isOpen: pendingId !== null,
    requestDelete,
    confirmDelete,
    cancelDelete,
  }
}
