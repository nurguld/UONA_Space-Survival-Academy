import { useEffect, useImperativeHandle, useRef, useState, type MouseEvent, type RefObject } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { isLunarNight } from '../game/engine'
import { getModuleName } from '../i18n/gameTranslations'
import type { ActiveBuild, ModuleDef, ModuleId, ModuleLevels, SceneNavigationHandle } from '../types'
import baseSceneImg from '../assets/game-base-scene.jpg'
import AstronautSprite from './AstronautSprite'
import LunarMapScene from './LunarMapScene'

interface BaseSceneProps {
  day: number
  maxDays: number
  lunarNightStartDay: number
  modules: ModuleLevels
  modulesDef: ModuleDef[]
  activeBuilds?: Partial<Record<ModuleId, ActiveBuild>>
  budget: number
  disabled: boolean
  highlightedModuleId?: ModuleId | null
  viewMode?: 'map' | 'classic'
  hideHeader?: boolean
  navigationRef?: RefObject<SceneNavigationHandle | null>
  onSelectModule: (moduleId: ModuleId) => void
}

const HOTSPOTS: {
  id: ModuleId
  left: string
  width: string
  height: string
}[] = [
  { id: 'lifeSupport', left: '1.5%', width: '21.5%', height: '58%' },
  { id: 'greenhouse', left: '24%', width: '21.5%', height: '56%' },
  { id: 'solar', left: '46%', width: '10.5%', height: '52%' },
  { id: 'battery', left: '57%', width: '7%', height: '24%' },
  { id: 'exercise', left: '64.5%', width: '15.5%', height: '50%' },
  { id: 'shield', left: '81%', width: '17.5%', height: '56%' },
]

// Yürüme alanı: sahnenin alt zemin şeridi (yüzde değerleri sahne boyutuna göre)
const FEET_MIN = 1.5
const FEET_MAX = 6.5
const WALK_SPEED = 75 // sahne genişliğinin yüzdesi / saniye (en uzak nokta ~1,3 sn)
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

export default function BaseScene({
  day,
  maxDays,
  lunarNightStartDay,
  modules,
  modulesDef,
  activeBuilds = {},
  budget,
  disabled,
  highlightedModuleId = null,
  viewMode: controlledViewMode,
  hideHeader = false,
  navigationRef,
  onSelectModule,
}: BaseSceneProps) {
  const { lang, pick } = useLanguage()
  const night = isLunarNight(day)
  const [internalViewMode, setInternalViewMode] = useState<'map' | 'classic'>('map')
  const viewMode = controlledViewMode ?? internalViewMode
  const setViewMode = setInternalViewMode

  // --- Klasik sahnede yürüyen astronot ---
  const sceneRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<number | null>(null)
  const posRef = useRef({ x: 50, y: 4 })
  const disabledRef = useRef(disabled)
  const selectRef = useRef(onSelectModule)
  const [pos, setPos] = useState({ x: 50, y: 4 })
  const [facing, setFacing] = useState<1 | -1>(1)
  const [walking, setWalking] = useState(false)
  const [walkMs, setWalkMs] = useState(0)

  useEffect(() => {
    disabledRef.current = disabled
    selectRef.current = onSelectModule
  }, [disabled, onSelectModule])
  useEffect(
    () => () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current)
    },
    [],
  )

  const walkTo = (x: number, y: number, onArrive?: () => void) => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current)
    const target = { x: clamp(x, 4, 96), y: clamp(y, FEET_MIN, FEET_MAX) }
    const dx = target.x - posRef.current.x
    const dy = target.y - posRef.current.y
    const ms = clamp((Math.hypot(dx, dy * 0.5) / WALK_SPEED) * 1000, 0, 1600)
    if (Math.abs(dx) > 0.5) setFacing(dx > 0 ? 1 : -1)
    posRef.current = target
    setPos(target)
    setWalkMs(ms)
    setWalking(ms > 0)
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null
      setWalking(false)
      onArrive?.()
    }, ms)
  }

  const handleGroundClick = (e: MouseEvent<HTMLDivElement>) => {
    if (disabled) return
    const rect = sceneRef.current?.getBoundingClientRect()
    if (!rect) return
    walkTo(
      ((e.clientX - rect.left) / rect.width) * 100,
      ((rect.bottom - e.clientY) / rect.height) * 100,
    )
  }

  const handleSpotClick = (e: MouseEvent<HTMLButtonElement>, spot: (typeof HOTSPOTS)[number]) => {
    // Klavye (Enter/Space) ile tetiklenirse beklemeden aç
    if (e.detail === 0) {
      onSelectModule(spot.id)
      return
    }
    const centerX = parseFloat(spot.left) + parseFloat(spot.width) / 2
    walkTo(centerX, 4, () => {
      if (!disabledRef.current) selectRef.current(spot.id)
    })
  }

  useImperativeHandle(viewMode === 'classic' ? navigationRef : undefined, () => ({
    walkToModule: (moduleId: ModuleId) => {
      if (disabledRef.current) return
      const spot = HOTSPOTS.find((s) => s.id === moduleId)
      if (!spot) return
      const centerX = parseFloat(spot.left) + parseFloat(spot.width) / 2
      walkTo(centerX, 4, () => {
        if (!disabledRef.current) selectRef.current(spot.id)
      })
    },
  }))
  const isFirstNightDay = day === lunarNightStartDay
  const daysUntilNight = lunarNightStartDay - day
  const getDef = (id: ModuleId) => modulesDef.find((m) => m.id === id)

  const batteryGain = (getDef('battery')?.perDay.energy ?? 5) * modules.battery

  let statusText = pick(
    'Lunar Day · Solar panels active',
    'Ay Gündüzü · Güneş panelleri aktif',
  )
  let statusBorder = 'border-amber-400/50 text-amber-200'

  if (night) {
    if (modules.battery > 0) {
      statusText = isFirstNightDay
        ? pick(
            `Lunar Night Started · Battery power active (+${batteryGain}/day)`,
            `Ay Gecesi Başladı · Batarya enerjisi devrede (+${batteryGain}/gün)`,
          )
        : pick(
            `Lunar Night · Battery power active (+${batteryGain}/day)`,
            `Ay Gecesi · Batarya enerjisi devrede (+${batteryGain}/gün)`,
          )
      statusBorder = 'border-emerald-400/80 text-emerald-200 shadow-[0_0_16px_rgba(52,211,153,0.28)]'
    } else {
      statusText = isFirstNightDay
        ? pick(
            'Lunar Night Started · Solar panels offline (No battery!)',
            'Ay Gecesi Başladı · Güneş panelleri durdu (Batarya yok!)',
          )
        : pick(
            'Lunar Night · Solar panels offline!',
            'Ay Gecesi · Güneş panelleri kapalı!',
          )
      statusBorder = 'border-orange-400 text-orange-200 shadow-[0_0_16px_rgba(251,146,60,0.25)]'
    }
  } else if (daysUntilNight > 0 && daysUntilNight <= 4) {
    statusText = pick(
      `Alert: Lunar night in ${daysUntilNight} day${daysUntilNight > 1 ? 's' : ''}`,
      `Uyarı: Ay gecesi ${daysUntilNight} gün içinde`,
    )
    statusBorder = 'border-orange-400 text-orange-200'
  }

  const headerBar = (
    <div className="relative z-[950] flex flex-wrap items-center justify-between gap-2.5 p-3.5 sm:p-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="bg-amber-400 text-slate-950 font-bold px-4 py-1.5 rounded-lg shadow-[0_0_16px_rgba(251,191,36,0.45)] text-sm sm:text-base">
          {pick(`Day ${day} / ${maxDays}`, `Gün ${day} / ${maxDays}`)}
        </div>

        {/* Harita / Klasik Sahne Seçici */}
        <div
          role="group"
          aria-label={pick('Scene View', 'Sahne Görünümü')}
          className="inline-flex rounded-lg border border-white/25 bg-[#09132A]/90 p-0.5 backdrop-blur-md"
        >
          <button
            type="button"
            onClick={() => setViewMode('map')}
            aria-pressed={viewMode === 'map'}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
              viewMode === 'map'
                ? 'bg-cyan-400 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            {pick('🗺️ 2.5D Map', '🗺️ 2.5D Harita')}
          </button>
          <button
            type="button"
            onClick={() => setViewMode('classic')}
            aria-pressed={viewMode === 'classic'}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
              viewMode === 'classic'
                ? 'bg-cyan-400 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            {pick('🏛️ Classic Scene', '🏛️ Klasik Sahne')}
          </button>
        </div>
      </div>

      <div
        className={`bg-[#09132A]/90 backdrop-blur-md text-xs sm:text-sm font-medium px-4 py-1.5 rounded-lg border transition-colors ${statusBorder}`}
      >
        {statusText}
      </div>
    </div>
  )

  return (
    <section
      aria-label={pick('Lunar Base Scene', 'Ay Üssü Sahnesi')}
      className={
        hideHeader
          ? 'relative w-full h-full overflow-x-auto overflow-y-clip bg-[#070E22]'
          : 'relative rounded-2xl border border-white/40 shadow-[0_0_32px_rgba(255,255,255,0.10)] overflow-x-auto overflow-y-clip bg-[#070E22]'
      }
    >
      {viewMode === 'map' ? (
        <LunarMapScene
          night={night}
          modules={modules}
          modulesDef={modulesDef}
          activeBuilds={activeBuilds}
          budget={budget}
          disabled={disabled}
          highlightedModuleId={highlightedModuleId}
          headerSlot={hideHeader ? undefined : headerBar}
          navigationRef={navigationRef}
          onSelectModule={onSelectModule}
        />
      ) : (
        <div
          ref={sceneRef}
          className={
            hideHeader
              ? 'relative min-w-[680px] w-full h-full'
              : 'relative min-w-[680px] aspect-[16/8] w-full'
          }
        >
          {/* Çizimli Ay Üssü Sahnesi */}
          <img
            src={baseSceneImg}
            alt={pick('Lunar Base Modules', 'Ay Üssü Modülleri')}
            fetchPriority="high"
            className={`absolute inset-0 w-full h-full object-cover object-bottom transition-all duration-700 ${
              night ? 'brightness-55 saturate-75' : 'brightness-100'
            }`}
          />

          {/* Ay Gecesi Ortam Karartması */}
          {night && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[#020617]/45 transition-opacity duration-700"
            />
          )}

          {/* Zemin şeridi: tıklanan noktaya astronot yürür */}
          <div
            aria-hidden="true"
            onClick={handleGroundClick}
            className={`absolute inset-x-0 bottom-0 z-[12] h-[8%] ${disabled ? '' : 'cursor-pointer'}`}
          />

          {/* Yürüyen astronot */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute z-[15]"
            style={{
              left: `${pos.x}%`,
              bottom: `${pos.y}%`,
              height: '17%',
              aspectRatio: '177 / 260',
              translate: '-50% 0',
              transition: `left ${walkMs}ms linear, bottom ${walkMs}ms linear`,
            }}
          >
            <div className="h-full w-full" style={{ transform: `scaleX(${facing})` }}>
              <AstronautSprite
                walking={walking}
                night={night}
                className={`h-full w-full drop-shadow-[0_6px_6px_rgba(0,0,0,0.45)] ${
                  walking ? 'astro-walking' : ''
                }`}
              />
            </div>
          </div>

          {/* Üst Bilgi Şeridi */}
          {!hideHeader && headerBar}

        {/* 6 Etkileşimli Yapı Alanı */}
        {HOTSPOTS.map((spot) => {
          const level = modules[spot.id]
          const def = getDef(spot.id)
          const build = activeBuilds[spot.id]
          const isMax = def ? level >= def.maxLevel : false
          const canAfford = def ? budget >= def.cost : false
          const isUnbuiltExercise = spot.id === 'exercise' && level === 0
          const hasEnergyShield = spot.id === 'shield' && level >= 3
          const isGuided = highlightedModuleId === spot.id
          const isBatteryActiveAtNight = night && spot.id === 'battery' && level > 0

          let arrowText = pick('↑ Build', '↑ Kur')
          if (build) {
            arrowText =
              build.assignedCrew > 0
                ? pick(
                    `👷 × ${build.assignedCrew} working`,
                    `👷 × ${build.assignedCrew} çalışıyor`,
                  )
                : pick('⏸ Paused', '⏸ Duraklatıldı')
          } else if (isMax) {
            arrowText = 'MAX'
          } else if (level > 0) {
            arrowText = pick(`↑ ${def?.cost ?? 0} pts`, `↑ ${def?.cost ?? 0} puan`)
          } else if (def) {
            arrowText = pick(`↑ Build · ${def.cost} pts`, `↑ Kur · ${def.cost} puan`)
          }

          const buildDone = build ? build.totalWork - build.remainingWork : 0
          const buildEta =
            build && build.assignedCrew > 0
              ? (() => {
                  const etaDays = Math.ceil(build.remainingWork / build.assignedCrew)
                  return pick(`${etaDays}d`, `${etaDays} gün`)
                })()
              : pick('Paused', 'Durdu')

          return (
            <button
              key={spot.id}
              type="button"
              data-module-anchor={spot.id}
              disabled={disabled}
              onClick={(e) => handleSpotClick(e, spot)}
              style={{
                left: spot.left,
                width: spot.width,
                height: spot.height,
                bottom: '3%',
              }}
              className="group absolute z-10 flex flex-col items-center justify-start cursor-pointer disabled:cursor-default focus:outline-none"
            >
              {/* Rehber Vurgusu veya Hover/Focus Oku */}
              {isGuided ? (
                <span className="tutorial-pulse mb-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border border-amber-200 bg-amber-400 text-slate-950 whitespace-nowrap">
                  {pick('Try now', 'Şimdi dene')} · {arrowText}
                </span>
              ) : (
                <span
                  className={`mb-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border backdrop-blur-sm transition-all opacity-85 sm:opacity-0 sm:translate-y-1 sm:group-hover:opacity-100 sm:group-hover:translate-y-0 sm:group-focus-visible:opacity-100 sm:group-focus-visible:translate-y-0 ${
                    build
                      ? 'bg-amber-400 border-amber-200 text-slate-950'
                      : isMax
                        ? 'bg-slate-900/90 border-slate-500 text-slate-300'
                        : canAfford
                          ? 'bg-cyan-400 border-cyan-200 text-slate-950 shadow-[0_0_12px_rgba(56,189,248,0.65)]'
                          : 'bg-slate-900/90 border-amber-400/60 text-amber-300'
                  }`}
                >
                  {arrowText}
                </span>
              )}

              {/* Modül Seviye Etiketi */}
              <span
                className={`text-[11px] sm:text-xs font-semibold bg-[#09132A]/90 border rounded-md px-2.5 py-1 backdrop-blur-sm transition-colors whitespace-nowrap shadow-md ${
                  build
                    ? 'border-amber-300 text-amber-200 shadow-[0_0_14px_rgba(251,191,36,0.35)]'
                    : isGuided
                      ? 'border-amber-300 text-amber-200 shadow-[0_0_18px_rgba(251,191,36,0.45)]'
                      : isBatteryActiveAtNight
                        ? 'border-emerald-400/80 text-emerald-200 shadow-[0_0_14px_rgba(52,211,153,0.35)]'
                        : 'border-white/50 group-hover:border-white group-focus-visible:border-white text-slate-100'
                }`}
              >
                {getModuleName(spot.id, lang)} · {pick('Lv.', 'Sv.')}{level}
              </span>

              {/* Aktif İnşaat İlerleme Rozeti */}
              {build && (
                <span className="mt-1 px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-bold bg-amber-500/20 border border-amber-300/70 text-amber-200 whitespace-nowrap shadow-sm">
                  🔨 {buildDone}/{build.totalWork} · 👷×{build.assignedCrew} · {buildEta}
                </span>
              )}

              {/* Egzersiz Sv.0 Kesikli Kilit Çerçevesi */}
              {isUnbuiltExercise && (
                <div
                  aria-hidden="true"
                  className={`mt-2 w-[88%] flex-1 rounded-xl border-2 border-dashed bg-[#070E22]/60 transition-colors ${
                    build || isGuided
                      ? 'border-amber-300'
                      : 'border-white/80 group-hover:border-white'
                  }`}
                />
              )}

              {/* Kalkan Sv.3+ Parlayan Enerji Kemeri */}
              {hasEnergyShield && (
                <div
                  aria-hidden="true"
                  className="mt-2 w-[92%] flex-1 rounded-t-full border-t-2 border-x-2 border-orange-400/75 shadow-[0_0_24px_rgba(251,146,60,0.35)] pointer-events-none"
                />
              )}
            </button>
          )
        })}
        </div>
      )}
    </section>
  )
}
