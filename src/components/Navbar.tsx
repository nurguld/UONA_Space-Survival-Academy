import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  getSoundMuted,
  playClick,
  setSoundMuted,
  startHomeAmbient,
} from '../game/sound'

const NAV_LINKS = [
  { to: '/', label: 'Ana sayfa' },
  { to: '/hazirlik', label: 'Brifing' },
  { to: '/oyun', label: 'Oyun' },
  { to: '/labs', label: 'Laboratuvarlar' },
  { to: '/kaynaklar', label: 'Kaynaklar' },
]

function SpeakerIcon({ muted }: { muted: boolean }) {
  if (muted) {
    return (
      <svg aria-hidden="true" viewBox="0 0 20 20" className="w-4 h-4 shrink-0" fill="none">
        <path
          d="M3.5 8v4h3.2L11 15.5V4.5L6.7 8H3.5Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M14 7.5l3.5 5M17.5 7.5l-3.5 5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    )
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="w-4 h-4 shrink-0" fill="none">
      <path
        d="M3.5 8v4h3.2L11 15.5V4.5L6.7 8H3.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M13.8 7.3a4.2 4.2 0 0 1 0 5.4M16 5.2a7 7 0 0 1 0 9.6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default function Navbar() {
  const { pathname } = useLocation()
  const [muted, setMuted] = useState(() => getSoundMuted())

  useEffect(() => {
    const syncMute = () => setMuted(getSoundMuted())
    window.addEventListener('jsa-mute-change', syncMute)
    window.addEventListener('storage', syncMute)
    return () => {
      window.removeEventListener('jsa-mute-change', syncMute)
      window.removeEventListener('storage', syncMute)
    }
  }, [])

  const handleToggleMute = () => {
    const next = !muted
    setMuted(next)
    setSoundMuted(next)
    if (!next) {
      playClick()
      if (pathname === '/') {
        startHomeAmbient()
      }
    }
  }

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
          const active =
            item.to === '/labs' ? pathname.startsWith('/labs') : pathname === item.to
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

        {pathname === '/' && (
          <button
            type="button"
            onClick={handleToggleMute}
            aria-pressed={muted}
            aria-label={muted ? 'Sesi aç' : 'Sesi kapat'}
            title={muted ? 'Sesi aç' : 'Sesi kapat'}
            className={`inline-flex items-center justify-center w-9 h-9 rounded-full border cursor-pointer transition-colors ${
              muted
                ? 'border-slate-300/25 bg-[#0A1224]/70 text-slate-400 hover:border-slate-300/50 hover:text-white'
                : 'border-slate-300/40 bg-[#0A1224]/85 text-slate-200 hover:border-cyan-300/65 hover:text-white'
            }`}
          >
            <SpeakerIcon muted={muted} />
          </button>
        )}
      </nav>
    </header>
  )
}
