import type { ReactNode } from 'react'

function Container({ children }: { children: ReactNode }) {
  return (
    <main className="max-w-5xl mx-auto px-4 py-6">
      {children}
    </main>
  )
}

export default Container
