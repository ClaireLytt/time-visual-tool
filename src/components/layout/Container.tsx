import type { ReactNode } from 'react'

/**
 * Page container — shared with Header for perfect alignment.
 * width: 100%, max-width: 1200px, centered, responsive padding.
 */
export const PAGE_CONTAINER_STYLE: React.CSSProperties = {
  width: '100%',
  maxWidth: 1200,
  marginLeft: 'auto',
  marginRight: 'auto',
  paddingLeft: 'clamp(16px, 4vw, 48px)',
  paddingRight: 'clamp(16px, 4vw, 48px)',
  boxSizing: 'border-box' as const,
}

function Container({ children }: { children: ReactNode }) {
  return (
    <main style={{ ...PAGE_CONTAINER_STYLE, paddingTop: 24, paddingBottom: 24 }}>
      {children}
    </main>
  )
}

export default Container
