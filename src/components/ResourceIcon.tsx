import type { ResourceId } from '../types'

export interface ResourceVisual {
  label: string
  shortLabel: string
  color: string
  textClass: string
  pillPositiveClass: string
  pillNegativeClass: string
}

export const RESOURCE_ORDER: ResourceId[] = [
  'energy',
  'oxygen',
  'food',
  'radiation',
  'health',
]

export const RESOURCE_CONFIG: Record<ResourceId, ResourceVisual> = {
  energy: {
    label: 'Enerji',
    shortLabel: 'Enerji',
    color: 'var(--color-energy)',
    textClass: 'text-amber-300',
    pillPositiveClass: 'border-amber-400/55 bg-amber-500/20 text-amber-200',
    pillNegativeClass: 'border-orange-400/60 bg-orange-500/20 text-orange-300',
  },
  oxygen: {
    label: 'Oksijen / Su',
    shortLabel: 'Oksijen',
    color: 'var(--color-oxygen)',
    textClass: 'text-sky-300',
    pillPositiveClass: 'border-sky-400/55 bg-sky-500/20 text-sky-200',
    pillNegativeClass: 'border-orange-400/60 bg-orange-500/20 text-orange-300',
  },
  food: {
    label: 'Gıda',
    shortLabel: 'Gıda',
    color: 'var(--color-food)',
    textClass: 'text-emerald-400',
    pillPositiveClass: 'border-emerald-400/55 bg-emerald-500/20 text-emerald-300',
    pillNegativeClass: 'border-orange-400/60 bg-orange-500/20 text-orange-300',
  },
  radiation: {
    label: 'Radyasyon Koruması',
    shortLabel: 'Radyasyon',
    color: 'var(--color-radiation)',
    textClass: 'text-orange-400',
    pillPositiveClass: 'border-emerald-400/55 bg-emerald-500/20 text-emerald-300',
    pillNegativeClass: 'border-orange-400/60 bg-orange-500/20 text-orange-300',
  },
  health: {
    label: 'Mürettebat Sağlığı',
    shortLabel: 'Sağlık',
    color: 'var(--color-health)',
    textClass: 'text-violet-300',
    pillPositiveClass: 'border-violet-400/55 bg-violet-500/20 text-violet-200',
    pillNegativeClass: 'border-orange-400/60 bg-orange-500/20 text-orange-300',
  },
}

export function ResourceIcon({
  id,
  className = 'w-4 h-4 shrink-0',
}: {
  id: ResourceId
  className?: string
}) {
  const colorClass = RESOURCE_CONFIG[id].textClass

  switch (id) {
    case 'energy':
      return (
        <svg aria-hidden="true" viewBox="0 0 16 16" className={`${className} ${colorClass}`}>
          <path d="M9 1L3 9h4l-1 6 7-8H9l0-6z" fill="currentColor" />
        </svg>
      )
    case 'oxygen':
      return (
        <svg aria-hidden="true" viewBox="0 0 16 16" className={`${className} ${colorClass}`}>
          <path
            d="M8 1.5C8 1.5 3.5 6.8 3.5 10a4.5 4.5 0 0 0 9 0C12.5 6.8 8 1.5 8 1.5Z"
            fill="currentColor"
            fillOpacity="0.25"
            stroke="currentColor"
            strokeWidth="1.6"
          />
        </svg>
      )
    case 'food':
      return (
        <svg aria-hidden="true" viewBox="0 0 16 16" className={`${className} ${colorClass}`}>
          <path
            d="M13 3C7 3 3.5 6.5 3.5 12.5c6 0 9.5-3.5 9.5-9.5Z"
            fill="currentColor"
            fillOpacity="0.88"
          />
        </svg>
      )
    case 'radiation':
      return (
        <svg aria-hidden="true" viewBox="0 0 16 16" className={`${className} ${colorClass}`}>
          <path
            d="M8 1.5L2.5 4v4.2c0 3.3 2.3 5.5 5.5 6.3 3.2-.8 5.5-3 5.5-6.3V4L8 1.5Z"
            fill="currentColor"
            fillOpacity="0.2"
            stroke="currentColor"
            strokeWidth="1.6"
          />
        </svg>
      )
    case 'health':
      return (
        <svg aria-hidden="true" viewBox="0 0 16 16" className={`${className} ${colorClass}`}>
          <path
            d="M8 13.5S2.5 9.8 2.5 5.8A3 3 0 0 1 8 4a3 3 0 0 1 5.5 1.8c0 4-5.5 7.7-5.5 7.7Z"
            fill="currentColor"
          />
        </svg>
      )
  }
}