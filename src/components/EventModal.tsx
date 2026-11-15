import { useEffect, useId, useRef } from 'react'
import type { GameEvent, ModuleDef, ModuleLevels, ResourceId } from '../types'
import { isOptionUnlocked } from '../game/engine'
import { RESOURCE_CONFIG, ResourceIcon } from './ResourceIcon'

interface EventModalProps {
  event: GameEvent | null
  modules: ModuleLevels
  modulesDef: ModuleDef[]
  onSelect: (optionIndex: number) => void
}

function EventCapsuleIllustration() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 112 92"
      className="hidden sm:block shrink-0 w-24 h-20 drop-shadow-[0_6px_14px_rgba(0,0,0,0.5)]"
    >
      <ellipse cx="56" cy="80" rx="46" ry="8" fill="#475569" stroke="#0F172A" strokeWidth="2.5" />
      <ellipse cx="32" cy="80" rx="7" ry="2.2" fill="#334155" />
      <ellipse cx="78" cy="81" rx="6" ry="2" fill="#334155" />
      <path
        d="M27 52 H18 V74 H27"
        fill="none"
        stroke="#94A3B8"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M27 52 H18 V74 H27"
        fill="none"
        stroke="#0F172A"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="82" y="54" width="12" height="14" rx="2.5" fill="#94A3B8" stroke="#0F172A" strokeWidth="2.5" />
      <line x1="85" y1="59" x2="91" y2="59" stroke="#0F172A" strokeWidth="2" />
      <line x1="85" y1="63" x2="91" y2="63" stroke="#0F172A" strokeWidth="2" />
      <line x1="42" y1="22" x2="42" y2="9" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="42" cy="8" r="3" fill="#38BDF8" stroke="#0F172A" strokeWidth="2" />
      <line x1="70" y1="22" x2="70" y2="11" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="70" cy="10" r="2.5" fill="#FBBF24" stroke="#0F172A" strokeWidth="2" />
      <path
        d="M26 76 V50 C26 31 39 20 56 20 C73 20 86 31 86 50 V76 Z"
        fill="#CBD5E1"
        stroke="#0F172A"
        strokeWidth="2.5"
      />
      <path
        d="M31 35 C37 25 46 20 56 20 C66 20 75 25 81 35 Z"
        fill="#60A5FA"
        stroke="#0F172A"
        strokeWidth="2.5"
      />
      <rect x="48" y="15" width="16" height="6" rx="2.5" fill="#94A3B8" stroke="#0F172A" strokeWidth="2.5" />
      <rect x="41" y="42" width="30" height="16" rx="5" fill="#0F172A" stroke="#64748B" strokeWidth="2" />
      <rect x="44" y="45" width="24" height="10" rx="3" fill="#FBBF24" />
      <path d="M46 47 H60" stroke="#FEF3C7" strokeWidth="2" strokeLinecap="round" />
      <rect x="46" y="62" width="20" height="14" rx="2" fill="#475569" stroke="#0F172A" strokeWidth="2.5" />
      <line x1="56" y1="62" x2="56" y2="76" stroke="#0F172A" strokeWidth="2" />
      <circle cx="34" cy="48" r="2.5" fill="#38BDF8" stroke="#0F172A" strokeWidth="1.5" />
      <circle cx="78" cy="48" r="2.5" fill="#38BDF8" stroke="#0F172A" strokeWidth="1.5" />
    </svg>
  )
}

function EarthCommsIllustration() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 96 88"
      className="hidden sm:block shrink-0 w-20 h-20 drop-shadow-[0_6px_14px_rgba(56,189,248,0.3)]"
    >
      {/* Sinyal halkaları */}
      <path
        d="M66 22 A18 18 0 0 1 78 36"
        fill="none"
        stroke="#38BDF8"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M72 14 A26 26 0 0 1 88 32"
        fill="none"
        stroke="#7DD3FC"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.75"
      />
      {/* Dünya küresi */}
      <circle cx="44" cy="46" r="28" fill="#1D4ED8" stroke="#93C5FD" strokeWidth="2.5" />
      <path
        d="M28 34 C34 30, 42 32, 46 38 C49 42, 44 48, 37 49 C31 50, 25 41, 28 34 Z"
        fill="#34D399"
      />
      <path
        d="M50 48 C56 44, 65 48, 66 56 C61 64, 52 68, 45 64 C44 57, 46 51, 50 48 Z"
        fill="#34D399"
      />
      <path
        d="M36 25 C44 21, 55 23, 60 30"
        fill="none"
        stroke="#E0F2FE"
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="w-3.5 h-3.5 shrink-0" fill="currentColor">
      <path d="M5 7V5a3 3 0 0 1 6 0v2h1a1.5 1.5 0 0 1 1.5 1.5v5A1.5 1.5 0 0 1 12 15H4a1.5 1.5 0 0 1-1.5-1.5v-5A1.5 1.5 0 0 1 4 7h1Zm1.5 0h3V5a1.5 1.5 0 1 0-3 0v2Z" />
    </svg>
  )
}

export default function EventModal({
  event,
  modules,
  modulesDef,
  onSelect,
}: EventModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (event && !dialog.open) {
      dialog.showModal()
    } else if (!event && dialog.open) {
      dialog.close()
    }
  }, [event])

  const getModuleName = (id: string) =>
    modulesDef.find((m) => m.id === id)?.name ?? id

  const firstUnlockedIndex = event
    ? event.options.findIndex((opt) => isOptionUnlocked(opt, modules))
    : -1

  const isEarthMessage = event?.kind === 'earth'

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={(e) => e.preventDefault()}
      {...({ closedby: 'none' } as Record<string, string>)}
      className="m-auto w-[min(94vw,40rem)] max-h-[92dvh] overflow-y-auto overscroll-contain rounded-2xl border border-slate-300/35 bg-gradient-to-b from-[#172133]/96 via-[#192336]/97 to-[#121A29]/98 backdrop-blur-xl text-slate-100 shadow-[0_20px_54px_rgba(4,9,20,0.72),0_0_24px_rgba(56,189,248,0.1)] p-5 sm:p-6"
    >
      {event && (
        <div className="flex flex-col gap-3.5">
          {/* Üst Başlık + Kapsül/Dünya Görseli */}
          <div className="flex items-start justify-between gap-3.5 border-b border-slate-300/20 pb-3.5">
            <div className="min-w-0">
              <span
                className={`text-[10px] font-bold uppercase tracking-[0.14em] ${
                  isEarthMessage ? 'text-emerald-300' : 'text-sky-400'
                }`}
              >
                {event.dayLabel ?? (isEarthMessage ? "Dünya'dan Mesaj" : 'Acil Durum Raporu')}
              </span>
              <h2
                id={titleId}
                className="text-xl sm:text-2xl font-extrabold tracking-tight text-white mt-0.5 leading-snug"
              >
                {event.title}
              </h2>
              <p className="text-slate-300/90 text-xs sm:text-sm mt-1 leading-relaxed">
                {event.description}
              </p>
            </div>

            <div className="hidden sm:flex w-[94px] h-[78px] rounded-xl border border-slate-300/30 bg-[#0C1424]/95 p-1.5 items-center justify-center shrink-0 shadow-inner">
              {isEarthMessage ? <EarthCommsIllustration /> : <EventCapsuleIllustration />}
            </div>
          </div>

          {/* Seçenek Kartları */}
          <div className="flex flex-col gap-2.5">
            {event.options.map((opt, index) => {
              const unlocked = isOptionUnlocked(opt, modules)
              const reqText = opt.requires
                ? `${getModuleName(opt.requires.moduleId)} Sv. ${opt.requires.minLevel}`
                : null

              const cardStyle = !unlocked
                ? 'border-slate-500/25 bg-[#0D1524]/65 opacity-60 cursor-not-allowed'
                : reqText || opt.badge
                  ? 'border-sky-300/45 bg-[#101829]/88 hover:border-sky-300/80 hover:bg-[#17243D] cursor-pointer shadow-sm'
                  : 'border-slate-300/25 bg-[#101829]/78 hover:border-slate-300/60 hover:bg-[#162238] cursor-pointer'

              return (
                <button
                  key={opt.label}
                  type="button"
                  autoFocus={index === firstUnlockedIndex}
                  disabled={!unlocked}
                  onClick={() => onSelect(index)}
                  className={`text-left rounded-xl border p-3.5 sm:p-4 transition-all focus-visible:outline-2 focus-visible:outline-cyan-300 ${cardStyle}`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm sm:text-base font-extrabold text-white leading-snug">
                      {opt.label}
                    </span>

                    <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                      {opt.badge && unlocked && (
                        <span className="rounded-md px-2.5 py-0.5 text-[11px] font-bold border border-cyan-300/50 bg-cyan-500/18 text-cyan-200">
                          {opt.badge}
                        </span>
                      )}

                      {reqText && (
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-0.5 text-[11px] font-bold border ${
                            unlocked
                              ? 'border-emerald-300/55 bg-emerald-500/18 text-emerald-200'
                              : 'border-amber-300/50 bg-amber-500/18 text-amber-200'
                          }`}
                        >
                          {!unlocked && <LockIcon />}
                          <span>
                            {unlocked ? `Açık · ${reqText}` : `Kilitli · ${reqText} gerekli`}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs sm:text-[13px] text-slate-300/90 mt-1 leading-relaxed">
                    {opt.explanation}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {opt.budgetDelta && opt.budgetDelta !== 0 && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-md border border-cyan-300/40 bg-cyan-500/15 text-cyan-200">
                        Bütçe {opt.budgetDelta > 0 ? `+${opt.budgetDelta}` : opt.budgetDelta}p
                      </span>
                    )}

                    {(Object.entries(opt.effects) as [ResourceId, number][]).map(([resId, val]) => {
                      const meta = RESOURCE_CONFIG[resId]
                      return (
                        <span
                          key={resId}
                          className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-md border ${
                            val >= 0 ? meta.pillPositiveClass : meta.pillNegativeClass
                          }`}
                        >
                          <ResourceIcon id={resId} className="w-3.5 h-3.5 shrink-0" />
                          <span>
                            {meta.shortLabel} {val > 0 ? `+${val}` : val}
                          </span>
                        </span>
                      )
                    })}

                    {opt.focusModuleId && (
                      <span className="inline-flex items-center text-[11px] font-semibold px-2.5 py-0.5 rounded-md border border-amber-300/40 bg-amber-500/15 text-amber-200">
                        Hedef: {getModuleName(opt.focusModuleId)}
                      </span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </dialog>
  )
}
