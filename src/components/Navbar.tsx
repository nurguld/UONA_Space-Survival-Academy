import { Link, useLocation } from 'react-router-dom'
import { playClick } from '../game/sound'

const NAV_LINKS = [
  { to: '/', label: 'Ana sayfa' },
  { to: '/hazirlik', label: 'Brifing' },
  { to: '/oyun', label: 'Oyun' },
  { to: '/kaynaklar', label: 'Kaynaklar' },
]

export default function Navbar() {
  const { pathname } = useLocation()

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 py-5 border-b border-white/15">
      <Link
        to="/"
        onClick={() => playClick()}
        className="text-base sm:text-lg font-bold tracking-[0.2em] uppercase text-white hover:text-cyan-300 transition-colors"
      >
        JUNIOR SPACE ACADEMY
      </Link>

      <nav aria-label="Ana menü" className="flex flex-wrap items-center gap-2 sm:gap-3">
        {NAV_LINKS.map((item) => {
          const active = pathname === item.to
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => playClick()}
              aria-current={active ? 'page' : undefined}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
                active
                  ? 'border-white/45 bg-white/10 text-white'
                  : 'border-transparent text-slate-300 hover:text-white hover:border-white/25'
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>
    </header>
  )
}
