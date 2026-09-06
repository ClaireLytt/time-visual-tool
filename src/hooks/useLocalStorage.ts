import { useState, useEffect } from 'react'

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  validate?: (data: unknown) => T | null,
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key)
      if (!item) return initialValue
      const parsed = JSON.parse(item)
      if (validate) {
        return validate(parsed) ?? initialValue
      }
      return parsed
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(storedValue))
    } catch {
      // localStorage full or unavailable
    }
  }, [key, storedValue])

  return [storedValue, setStoredValue]
}
