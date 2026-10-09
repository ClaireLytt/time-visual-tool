import { useState } from 'react'
import AnimatedCollapse from './AnimatedCollapse'

interface CollapsibleFormProps {
  children: React.ReactNode
  accentColor: string
  addLabel: string
}

export default function CollapsibleForm({ children, accentColor, addLabel }: CollapsibleFormProps) {
  const [open, setOpen] = useState(false)

  return (
    <div>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="w-full panel p-3 text-center transition-colors hover:shadow-elevated"
          style={{ color: accentColor }}
        >
          <span className="text-lg">+</span> <span className="text-sm font-medium">{addLabel}</span>
        </button>
      )}
      <AnimatedCollapse open={open}>
        <div className="relative">
          {children}
          <button
            onClick={() => setOpen(false)}
            className="absolute top-2 right-2 btn-icon text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Close"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </AnimatedCollapse>
    </div>
  )
}
