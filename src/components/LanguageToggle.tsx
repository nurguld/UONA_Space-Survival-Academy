import { useLanguage, type Language } from '../context/LanguageContext'
import { playClick } from '../game/sound'

interface LanguageToggleProps {
  variant?: 'navbar' | 'menu'
}

const OPTIONS: { id: Language; label: string }[] = [
  { id: 'en', label: 'EN' },
  { id: 'tr', label: 'TR' },
]

export default function LanguageToggle({ variant = 'navbar' }: LanguageToggleProps) {
  const { lang, setLang, pick } = useLanguage()

  const handleSelect = (next: Language) => {
    if (next === lang) return
    playClick()
    setLang(next)
  }

  if (variant === 'menu') {
    return (
      <div
        role="group"
        aria-label={pick('Language', 'Dil')}
        className="w-full px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-between gap-2"
      >
        <span className="text-slate-300 font-medium text-xs">
          {pick('🌐 Language', '🌐 Dil')}
        </span>
        <div className="inline-flex items-center rounded-md border border-white/15 bg-[#050B18] p-0.5">
          {OPTIONS.map((opt) => {
            const active = lang === opt.id
            return (
              <button
                key={opt.id}
                type="button"
                aria-pressed={active}
                onClick={() => handleSelect(opt.id)}
                className={`px-2 py-0.5 rounded text-[11px] font-bold tracking-wider transition-colors cursor-pointer ${
                  active
                    ? 'bg-cyan-400/20 text-cyan-200 border border-cyan-300/45'
                    : 'text-slate-400 hover:text-white border border-transparent'
                }`}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div
      role="group"
      aria-label={pick('Language', 'Dil')}
      className="inline-flex items-center rounded-lg border border-white/25 bg-[#0A1224]/85 p-0.5 shadow-sm"
    >
      {OPTIONS.map((opt) => {
        const active = lang === opt.id
        return (
          <button
            key={opt.id}
            type="button"
            aria-pressed={active}
            onClick={() => handleSelect(opt.id)}
            className={`px-2.5 py-1 rounded-md text-xs font-bold tracking-wider transition-colors cursor-pointer ${
              active
                ? 'bg-white/20 text-white border border-white/30'
                : 'text-slate-400 hover:text-white border border-transparent'
            }`}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
