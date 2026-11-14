import type { ReactNode } from 'react'

export default function Card({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`bg-panel border-[3px] border-line shadow-[0_4px_0_#05070F] p-4 ${className}`}>
      {children}
    </div>
  )
}