import { createContext, useContext, useMemo } from 'react'
import type { Category } from '../types'
import { CATEGORY_COLORS } from '../constants'

interface CategoryContextValue {
  categories: Category[]
  getColor: (name: string) => string
}

const CategoryContext = createContext<CategoryContextValue>({
  categories: [],
  getColor: () => '#94a3b8',
})

export function CategoryProvider({ categories, children }: { categories: Category[]; children: React.ReactNode }) {
  const value = useMemo(() => {
    const colorMap: Record<string, string> = { ...CATEGORY_COLORS }
    for (const cat of categories) {
      colorMap[cat.name] = cat.color
    }
    return {
      categories,
      getColor: (name: string) => colorMap[name] ?? '#94a3b8',
    }
  }, [categories])

  return <CategoryContext.Provider value={value}>{children}</CategoryContext.Provider>
}

export function useCategories() {
  return useContext(CategoryContext)
}
