import { useEffect, useId, useRef } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { MODULE_SPRITES } from '../game/moduleSprites'
import { playClick } from '../game/sound'
import { getModuleName } from '../i18n/gameTranslations'
import type { ActiveBuild, ModuleDef, ModuleId, ModuleLevels } from '../types'

interface CrewTasksDrawerProps {
  isOpen: boolean
  crewCount: number
  idleCrew: number
  budget: number
  modules: ModuleLevels
  modulesDef: ModuleDef[]
  activeBuilds: Partial<Record<ModuleId, ActiveBuild>>
  disabled: boolean
  onSelectModule: (moduleId: ModuleId) => void
  onClose: () => void
}

export function AstronautHelmetIcon({
  muted = false,
  className = 'w-8 h-8 shrink-0',
}: {
  muted?: boolean
  className?: string
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 40 40"
      className={`${className} ${muted ? 'opacity-28 grayscale' : 'drop-shadow-[0_2px_5px_rgba(0,0,0,0.45)]'}`}
    >
      {/* Boyun halkası */}
      <path
        d="M9.5 29 C14 33, 26 33, 30.5 28.5 L29 33 C24 36, 16 36, 11 33 Z"
        fill="#CBD5E1"
        stroke="#0F172A"
        strokeWidth="2.1"
        strokeLinejoin="round"
      />
      {/* Ana 3/4 kask gövdesi */}
      <ellipse
        cx="20.5"
        cy="18.5"
        rx="14"
        ry="13.8"
        fill="#F8FAFC"
        stroke="#0F172A"
        strokeWidth="2.4"
      />
      {/* Kask üst/sol gölge vurgusu */}
      <path
        d="M10 11.5 C12.5 6.8, 18.5 5.2, 24.5 6.4"
        stroke="#FFFFFF"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
      {/* 3/4 mavi-gri vizör camı */}
      <path
        d="M18 9.2 C27.2 9, 33 13.4, 32.8 19.6 C32.6 25.5, 26.5 28.2, 18.4 27.6 C14.6 27.2, 14 23.4, 14 18.8 C14 13.6, 15 9.5, 18 9.2 Z"
        fill="#475569"
        stroke="#0F172A"
        strokeWidth="2.2"
      />
      {/* İç cam derinlik gölgesi */}
      <path
        d="M17.2 24.6 C21.5 26.4, 28.2 25.4, 30.8 21.5"
        stroke="#334155"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      />
      {/* Vizör camı parlama çizgisi */}
      <path
        d="M17.5 12.8 C21 11.3, 25.5 11.8, 28.2 14.3"
        stroke="#E0F2FE"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="29.5" cy="17.2" r="1.15" fill="#BAE6FD" />
      {/* Sol yan iletişim kulaklığı */}
      <circle cx="9.2" cy="20" r="4.4" fill="#CBD5E1" stroke="#0F172A" strokeWidth="2.1" />
      <circle cx="9.2" cy="20" r="1.8" fill="#64748B" />
    </svg>
  )
}

function CrewTasksContent({
  crewCount,
  idleCrew,
  budget,
  modules,
  modulesDef,
  activeBuilds,
  disabled,
  onSelectModule,
  onClose,
}: Omit<CrewTasksDrawerProps, 'isOpen'>) {
  const { lang, pick } = useLanguage()
  const panelRef = useRef<HTMLElement>(null)
  const titleId = useId()

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
      }
    }
    const onPointerDown = (e: globalThis.PointerEvent) => {
      const target = e.target as HTMLElement | null
      if (!target) return
      if (panelRef.current?.contains(target)) return
      if (target.closest('[data-crew-toggle="true"]')) return
      onClose()
    }

    window.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [onClose])

  const activeBuildList = modulesDef
    .map((mod) => ({ mod, build: activeBuilds[mod.id] }))
    .filter((item): item is { mod: ModuleDef; build: ActiveBuild } => Boolean(item.build))

  const upgradeableList = modulesDef.filter((mod) => !activeBuilds[mod.id])
  const shownIdleSlots = Math.min(idleCrew, 3)

  return (
    <section
      ref={panelRef}
      role="dialog"
      aria-labelledby={titleId}
      className="crew-drawer-in fixed right-3 sm:right-4 top-24 bottom-20 my-auto z-[960] w-[min(92vw,21.5rem)] max-h-[min(74dvh,35.5rem)] flex flex-col rounded-2xl border border-slate-300/35 bg-gradient-to-b from-[#172133]/93 via-[#192336]/95 to-[#121A29]/96 backdrop-blur-xl text-slate-100 shadow-[0_18px_48px_rgba(4,9,20,0.75)]"
    >
      {/* Üst Başlık */}
      <div
        style={{
          backgroundImage:
            'radial-gradient(circle at 0% 0%, rgba(56, 189, 248, 0.16), transparent 55%)',
        }}
        className="flex items-center justify-between gap-2 px-4 py-3 rounded-t-2xl bg-[#192438]/95 border-b border-slate-300/20 shrink-0"
      >
        <h2 id={titleId} className="text-xs sm:text-[13px] font-bold uppercase tracking-wider text-slate-100">
          {pick(`Crew & Tasks (${idleCrew}/${crewCount})`, `Ekip & Görevler (${idleCrew}/${crewCount})`)}
        </h2>
        <button
          type="button"
          onClick={() => {
            playClick()
            onClose()
          }}
          aria-label={pick('Close Crew & Tasks Panel', 'Ekip ve Görevler Panelini Kapat')}
          className="inline-flex items-center justify-center w-6 h-6 rounded-full border border-slate-300/45 text-slate-200 hover:bg-white/10 hover:text-white cursor-pointer transition-colors text-xs leading-none"
        >
          ×
        </button>
      </div>

      {/* Kaydırılabilir İçerik */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-3.5 flex flex-col gap-4">
        {/* 1. Aktif Yapılan İşler */}
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#E9D79E] mb-2">
            {pick('Active Builds', 'Aktif Yapılan İşler')}
          </h3>

          <div className="flex flex-col gap-2">
            {activeBuildList.map(({ mod, build }) => {
              const done = build.totalWork - build.remainingWork
              const pct = Math.max(8, Math.min(100, Math.round((done / Math.max(1, build.totalWork)) * 100)))
              const daysLeft =
                build.assignedCrew > 0 ? Math.ceil(build.remainingWork / build.assignedCrew) : null
              const modName = getModuleName(mod.id, lang)
              const lvLabel = pick('Lv.', 'Sv.')

              return (
                <button
                  key={mod.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    playClick()
                    onSelectModule(mod.id)
                    onClose()
                  }}
                  className="w-full text-left rounded-xl border border-slate-100/70 bg-[#101827]/75 hover:border-cyan-300/80 hover:bg-[#142035] px-3 py-2.5 flex items-center gap-2.5 cursor-pointer disabled:cursor-default transition-colors"
                >
                  <AstronautHelmetIcon className="w-9 h-9 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-semibold text-white truncate">
                        • {pick(`${modName} Build`, `${modName} İnşası`)} ({lvLabel} {build.targetLevel})
                      </span>
                      <span
                        className={`shrink-0 text-[11px] font-medium ${
                          daysLeft === null ? 'text-orange-300' : 'text-slate-300'
                        }`}
                      >
                        {daysLeft === null
                          ? pick('Paused', 'Duraklatıldı')
                          : pick(`${daysLeft}d Left`, `${daysLeft} Gün Kaldı`)}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full rounded-full bg-white/12 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-slate-200/85 transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </button>
              )
            })}

            {Array.from({ length: shownIdleSlots }).map((_, idx) => (
              <div
                key={`idle-${idx}`}
                className="rounded-xl border border-slate-400/20 bg-[#121B2B]/45 px-3 py-1.5 flex items-center gap-2.5"
              >
                <AstronautHelmetIcon muted className="w-8 h-8 shrink-0" />
                <span className="text-xs font-medium text-slate-400/90">
                  {idx === shownIdleSlots - 1 && idleCrew > shownIdleSlots
                    ? pick(
                        `- Idle Crew (+${idleCrew - shownIdleSlots + 1}) -`,
                        `- Boşta Mürettebat (+${idleCrew - shownIdleSlots + 1}) -`,
                      )
                    : pick('- Idle Crew -', '- Boşta Mürettebat -')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Yükseltilebilecek Şeyler */}
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#E9D79E] mb-1">
            {pick('Available Upgrades', 'Yükseltilebilecek Şeyler')}
          </h3>

          <div className="divide-y divide-slate-300/15">
            {upgradeableList.map((mod) => {
              const level = modules[mod.id]
              const isMax = level >= mod.maxLevel
              const canAfford = !isMax && budget >= mod.cost
              const insufficient = !isMax && budget < mod.cost
              const modName = getModuleName(mod.id, lang)
              const lvLabel = pick('Lv.', 'Sv.')

              return (
                <button
                  key={mod.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    playClick()
                    onSelectModule(mod.id)
                    onClose()
                  }}
                  className="w-full text-left py-2.5 px-1 flex items-center justify-between gap-2.5 hover:bg-white/[0.04] rounded-lg cursor-pointer disabled:cursor-default transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={MODULE_SPRITES[mod.id]}
                      alt=""
                      draggable={false}
                      className="w-10 h-10 object-contain shrink-0 drop-shadow-[0_2px_4px_rgba(0,0,0,0.45)]"
                    />
                    <span
                      className={`text-xs sm:text-[13px] font-medium truncate ${
                        insufficient ? 'text-rose-400' : isMax ? 'text-emerald-200' : 'text-slate-100'
                      }`}
                    >
                      <span className={insufficient ? 'text-rose-400 mr-1' : 'text-slate-300 mr-1'}>
                        •
                      </span>
                      {modName}{' '}
                      <span className={insufficient ? 'text-rose-400' : 'text-slate-200'}>
                        {isMax ? `(${lvLabel} ${level} MAX)` : `(${lvLabel} ${level + 1})`}
                      </span>
                    </span>
                  </div>

                  {isMax ? (
                    <span className="shrink-0 px-2.5 py-1 rounded-lg border border-emerald-400/45 bg-emerald-950/45 text-[11px] font-bold text-emerald-200">
                      MAX
                    </span>
                  ) : canAfford ? (
                    <span className="shrink-0 min-w-12 text-center px-2.5 py-1 rounded-lg border border-slate-200/70 bg-[#0F1726]/85 text-xs font-extrabold text-white">
                      {mod.cost} P
                    </span>
                  ) : (
                    <div className="shrink-0 flex items-center gap-1.5">
                      <span
                        aria-label={pick('Insufficient points', 'Yetersiz puan')}
                        className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-rose-500 text-[10px] font-black text-white shadow-[0_0_10px_rgba(244,63,94,0.9)]"
                      >
                        !
                      </span>
                      <div className="min-w-12 px-2 py-0.5 rounded-lg border border-rose-400/85 bg-[#2A1419]/85 text-center leading-tight shadow-[0_0_14px_rgba(244,63,94,0.45)]">
                        <span className="block text-[11px] font-extrabold text-rose-300">
                          {mod.cost} P
                        </span>
                        <span className="block text-[9px] font-semibold text-rose-300/95">
                          {pick('Needed', 'Gerekli')}
                        </span>
                      </div>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

export default function CrewTasksDrawer({ isOpen, ...props }: CrewTasksDrawerProps) {
  if (!isOpen) return null
  return <CrewTasksContent {...props} />
}
