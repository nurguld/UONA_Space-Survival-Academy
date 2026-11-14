import type { ButtonHTMLAttributes } from 'react'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost'
}

export default function Button({ variant = 'primary', className = '', ...props }: Props) {
  const base =
    'font-pixel text-lg px-6 min-h-11 shadow-[0_4px_0_#05070F] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
  const styles =
    variant === 'primary'
      ? 'bg-accent text-space font-bold'
      : 'bg-transparent text-white border-[3px] border-line'
  return <button className={`${base} ${styles} ${className}`} {...props} />
}