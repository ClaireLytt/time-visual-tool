import { useCallback } from 'react'
import { useFirestore } from './useFirestore'
import { DEFAULT_HABITS } from '../constants/habit'
import type { Habit, HabitCheck, HabitStorageData } from '../types/habit'

function validate(raw: unknown): HabitStorageData | null {
  if (typeof raw !== 'object' || raw === null) return null
  const obj = raw as Record<string, unknown>
  if (!Array.isArray(obj.habits)) return null
  return {
    version: 1,
    habits: obj.habits as Habit[],
    checks: Array.isArray(obj.checks) ? (obj.checks as HabitCheck[]) : [],
  }
}

const INITIAL: HabitStorageData = { version: 1, habits: DEFAULT_HABITS, checks: [] }

export function useHabitEntries() {
  const { data, setData, loading } = useFirestore<HabitStorageData>('habitData', INITIAL, validate)

  const addHabit = useCallback((habit: Habit) => {
    setData(prev => ({ ...prev, habits: [...prev.habits, habit] }))
  }, [setData])

  const updateHabit = useCallback((id: string, updates: Partial<Habit>) => {
    setData(prev => ({
      ...prev,
      habits: prev.habits.map(h => h.id === id ? { ...h, ...updates } : h),
    }))
  }, [setData])

  const deleteHabit = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      habits: prev.habits.filter(h => h.id !== id),
      checks: prev.checks.filter(c => c.habitId !== id),
    }))
  }, [setData])

  const toggleCheck = useCallback((habitId: string, date: string) => {
    setData(prev => {
      const exists = prev.checks.some(c => c.habitId === habitId && c.date === date)
      return {
        ...prev,
        checks: exists
          ? prev.checks.filter(c => !(c.habitId === habitId && c.date === date))
          : [...prev.checks, { habitId, date }],
      }
    })
  }, [setData])

  const isChecked = useCallback((habitId: string, date: string) => {
    return data.checks.some(c => c.habitId === habitId && c.date === date)
  }, [data.checks])

  const getCheckedDatesForHabit = useCallback((habitId: string) => {
    return data.checks.filter(c => c.habitId === habitId).map(c => c.date)
  }, [data.checks])

  const getCheckedCountForDate = useCallback((date: string) => {
    return data.checks.filter(c => c.date === date).length
  }, [data.checks])

  return {
    habits: data.habits,
    checks: data.checks,
    loading,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleCheck,
    isChecked,
    getCheckedDatesForHabit,
    getCheckedCountForDate,
  }
}
