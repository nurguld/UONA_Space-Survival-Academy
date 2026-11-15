import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useLanguage, type Language } from '../context/LanguageContext'
import { EVENTS, calculateDailyDelta, getModuleWorkCost } from '../game/engine'
import { playClick } from '../game/sound'
import { getModuleDesc, getModuleName, getResourceLabel } from '../i18n/gameTranslations'
import type { ActiveBuild, ModuleDef, ModuleId, ModuleLevels, Resources } from '../types'
import BuildingSprite from './BuildingSprite'
import { RESOURCE_ORDER, ResourceIcon } from './ResourceIcon'

interface UpgradeModalProps {
  moduleId: ModuleId | null
  modulesDef: ModuleDef[]
  levels: ModuleLevels
  resources: Resources
  day: number
  budget: number
  crewCount: number
  idleCrew: number
  activeBuild?: ActiveBuild
  disabled: boolean
  onStartBuild: (moduleId: ModuleId, assignCrew: number) => void
  onAdjustCrew: (moduleId: ModuleId, deltaCrew: number) => void
  onClose: () => void
}

const MODULE_HOW_IT_WORKS: Record<Language, Record<ModuleId, string>> = {
  en: {
    solar:
      'Converts sunlight into electrical power. Generates strong output during Lunar Day, then pauses at sunset when Lunar Night begins.',
    lifeSupport:
      'Produces breathable oxygen for astronauts and recycles moisture from breath and sweat into clean drinking water.',
    battery:
      'Stores daytime solar electricity and keeps the base powered continuously throughout the sunless Lunar Night.',
    greenhouse:
      'Grows fresh food hydroponically for the crew; crops absorb CO₂ by day while irrigation and grow lights use water and energy.',
    exercise:
      'Prevents muscle and bone density loss in 1/6th lunar gravity, actively improving crew health every single day.',
    shield:
      'Shields the habitat from solar flares and cosmic radiation. Higher levels unlock extra protective responses during emergencies.',
  },
  tr: {
    solar:
      'Güneş ışığını elektrik enerjisine dönüştürür. Ay gününde çok yüksek enerji üretir; ancak Ay Gecesinde güneş battığı için üretim durur.',
    lifeSupport:
      'Astronotların nefes alabilmesi için oksijen üretir, solunum ve terdeki nemi bile geri dönüştürerek temiz su sağlar.',
    battery:
      'Güneş panellerinin gündüz ürettiği enerjiyi depolar ve özellikle güneşsiz Ay Gecesinde üssün enerjisini kesintisiz tutar.',
    greenhouse:
      'Hidroponik tarımla mürettebat için taze gıda yetiştirir; bitkiler gündüz karbondioksiti emer ama sulama ve büyütme lambaları su ve enerji tüketir.',
    exercise:
      'Düşük Ay yerçekiminde astronotların kas ve kemik erimesini önler; her gün mürettebat sağlığını aktif olarak artırır.',
    shield:
      'Güneş patlamaları ve kozmik radyasyona karşı üssü zırhlar. Yükseltildiğinde rastgele tehlikelere karşı ek savunma seçeneklerinin kilidini açar.',
  },
}

function formatSigned(value: number): string {
  return value > 0 ? `+${value}` : String(value)
}

function AstronautBadgeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" aria-hidden="true">
      <circle cx="12" cy="11" r="7.5" fill="#F8FAFC" stroke="#1E293B" strokeWidth="1.7" />
      <rect x="7" y="7.5" width="10" height="6.2" rx="3" fill="#0F172A" stroke="#38BDF8" strokeWidth="1.2" />
      <path d="M9.2 9.2h3.4" stroke="#7DD3FC" strokeWidth="1.3" strokeLinecap="round" />
      <path
        d="M7.5 18.8c1-1.7 2.6-2.5 4.5-2.5s3.5.8 4.5 2.5"
        fill="#F59E0B"
        stroke="#1E293B"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  )
}

interface UpgradePanelContentProps {
  mod: ModuleDef
  levels: ModuleLevels
  resources: Resources
  day: number
  budget: number
  crewCount: number
  idleCrew: number
  activeBuild?: ActiveBuild
  disabled: boolean
  onStartBuild: (moduleId: ModuleId, assignCrew: number) => void
  onAdjustCrew: (moduleId: ModuleId, deltaCrew: number) => void
  onClose: () => void
}

function UpgradePanelContent({
  mod,
  levels,
  resources,
  day,
  budget,
  crewCount,
  idleCrew,
  activeBuild,
  disabled,
  onStartBuild,
  onAdjustCrew,
  onClose,
}: UpgradePanelContentProps) {
  const { lang, pick } = useLanguage()
  const modName = getModuleName(mod.id, lang)
  const modDesc = getModuleDesc(mod.id, lang)
  const lvLabel = pick('Lv.', 'Sv.')
  const wrapperRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const leftArrowRef = useRef<SVGSVGElement>(null)
  const rightArrowRef = useRef<SVGSVGElement>(null)
  const [selectedCrew, setSelectedCrew] = useState(1)

  useLayoutEffect(() => {
    const syncPosition = () => {
      const wrapper = wrapperRef.current
      const card = cardRef.current
      const leftArrow = leftArrowRef.current
      const rightArrow = rightArrowRef.current
      if (!wrapper || !card || !leftArrow || !rightArrow) return

      const vw = window.innerWidth
      const vh = window.innerHeight
      const safeTop = vw >= 640 ? 84 : 112
      const safeBottom = vh - 78
      const cardW = card.offsetWidth || Math.min(vw * 0.94, 416)
      const cardH = card.offsetHeight || 430

      const anchorEl = document.querySelector<HTMLElement>(`[data-module-anchor="${mod.id}"]`)
      if (!anchorEl) {
        const fallbackLeft = Math.max(12, vw - cardW - 16)
        const fallbackTop = Math.max(safeTop, Math.min(safeBottom - cardH, safeTop))
        wrapper.style.left = `${Math.round(fallbackLeft)}px`
        wrapper.style.top = `${Math.round(fallbackTop)}px`
        wrapper.style.transformOrigin = 'top right'
        leftArrow.style.display = 'none'
        rightArrow.style.display = 'none'
        return
      }

      const rect = anchorEl.getBoundingClientRect()
      const gap = 22
      const spaceRight = vw - rect.right - 12
      const spaceLeft = rect.left - 12

      const placeOnRight = spaceRight >= cardW + gap || spaceRight >= spaceLeft

      let left: number
      if (placeOnRight) {
        left = Math.min(vw - cardW - 12, rect.right + gap)
        left = Math.max(12, left)
      } else {
        left = Math.max(12, rect.left - cardW - gap)
      }

      const targetY = rect.top + rect.height * 0.44
      const idealTop = targetY - Math.min(cardH * 0.34, 150)
      const maxTop = Math.max(safeTop, safeBottom - cardH)
      const top = Math.max(safeTop, Math.min(maxTop, idealTop))

      wrapper.style.left = `${Math.round(left)}px`
      wrapper.style.top = `${Math.round(top)}px`

      const arrowHalfH = 17
      const arrowTop = Math.max(36, Math.min(Math.max(36, cardH - 56), targetY - top - arrowHalfH))
      const rightClearance = left - rect.right
      const leftClearance = rect.left - (left + cardW)

      if (placeOnRight && rightClearance >= 6) {
        leftArrow.style.display = 'block'
        leftArrow.style.top = `${Math.round(arrowTop)}px`
        rightArrow.style.display = 'none'
        wrapper.style.transformOrigin = `left ${Math.round(arrowTop + arrowHalfH)}px`
      } else if (!placeOnRight && leftClearance >= 6) {
        leftArrow.style.display = 'none'
        rightArrow.style.display = 'block'
        rightArrow.style.top = `${Math.round(arrowTop)}px`
        wrapper.style.transformOrigin = `right ${Math.round(arrowTop + arrowHalfH)}px`
      } else {
        leftArrow.style.display = 'none'
        rightArrow.style.display = 'none'
        wrapper.style.transformOrigin = 'center center'
      }
    }

    syncPosition()

    let rafId = 0
    const tick = () => {
      syncPosition()
      rafId = window.requestAnimationFrame(tick)
    }
    rafId = window.requestAnimationFrame(tick)

    window.addEventListener('resize', syncPosition)
    return () => {
      window.cancelAnimationFrame(rafId)
      window.removeEventListener('resize', syncPosition)
    }
  }, [mod.id])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null
      if (!target) return
      if (wrapperRef.current && !wrapperRef.current.contains(target)) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKey)
    document.addEventListener('pointerdown', handlePointerDown)
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [onClose])

  const currentLevel = levels[mod.id]
  const isMaxLevel = currentLevel >= mod.maxLevel
  const nextLevel = Math.min(mod.maxLevel, currentLevel + 1)
  const upgradeCost = mod.cost
  const workCost = getModuleWorkCost(mod)

  const afterLevels: ModuleLevels = { ...levels, [mod.id]: nextLevel }
  const beforeDelta = calculateDailyDelta(levels, day, resources, crewCount)
  const afterDelta = calculateDailyDelta(afterLevels, day, resources, crewCount)

  const netEffects = RESOURCE_ORDER.filter((key) => {
    const before = beforeDelta[key] ?? 0
    const after = afterDelta[key] ?? 0
    return before !== after || (mod.perDay[key] ?? 0) !== 0
  })

  const unlockedEventCount = isMaxLevel
    ? 0
    : EVENTS.filter((ev) =>
        ev.options.some(
          (opt) => opt.requires?.moduleId === mod.id && opt.requires.minLevel === nextLevel,
        ),
      ).length

  const hasIdleCrew = idleCrew > 0
  const assignableCrew = hasIdleCrew ? Math.min(selectedCrew, idleCrew) : 0
  const estimatedDays = assignableCrew > 0 ? Math.ceil(workCost / assignableCrew) : workCost
  const canAfford = budget >= upgradeCost
  const canStart = !disabled && !isMaxLevel && !activeBuild && canAfford && hasIdleCrew

  const activeWorkDone = activeBuild
    ? Math.max(0, activeBuild.totalWork - activeBuild.remainingWork)
    : 0
  const remainingActiveDays =
    activeBuild && activeBuild.assignedCrew > 0
      ? Math.ceil(activeBuild.remainingWork / activeBuild.assignedCrew)
      : null
  const activeProgressPct = activeBuild
    ? Math.min(100, Math.round((activeWorkDone / Math.max(1, activeBuild.totalWork)) * 100))
    : 0

  const startButtonLabel = activeBuild
    ? pick('Under Construction', 'İnşaat Sürüyor')
    : !canAfford
      ? pick('Insufficient Budget', 'Yetersiz Bütçe')
      : !hasIdleCrew
        ? pick('No Idle Astronaut', 'Boşta Astronot Yok')
        : pick('Start Construction', 'İnşaatı Başlat')

  return (
    <div
      ref={wrapperRef}
      role="dialog"
      aria-modal="false"
      aria-label={pick(`${modName} station info and build`, `${modName} istasyon bilgisi ve inşaatı`)}
      className="upgrade-popover-in fixed z-[965] w-[min(94vw,26rem)] overflow-visible"
    >
      {/* Sol ok (panel binanın sağında açıldığında binayı gösterir) */}
      <svg
        ref={leftArrowRef}
        viewBox="0 0 24 34"
        style={{ display: 'none' }}
        className="pointer-events-none absolute -left-[22px] w-[24px] h-[34px] z-20 drop-shadow-[-4px_2px_8px_rgba(0,0,0,0.45)]"
        aria-hidden="true"
      >
        <polygon points="24,1 2,17 24,33" fill="#182235" />
        <polyline
          points="23,1 2,17 23,33"
          fill="none"
          stroke="rgba(203, 213, 225, 0.35)"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
      </svg>

      {/* Sağ ok (panel binanın solunda açıldığında binayı gösterir) */}
      <svg
        ref={rightArrowRef}
        viewBox="0 0 24 34"
        style={{ display: 'none' }}
        className="pointer-events-none absolute -right-[22px] w-[24px] h-[34px] z-20 drop-shadow-[4px_2px_8px_rgba(0,0,0,0.45)]"
        aria-hidden="true"
      >
        <polygon points="0,1 22,17 0,33" fill="#182235" />
        <polyline
          points="1,1 22,17 1,33"
          fill="none"
          stroke="rgba(203, 213, 225, 0.35)"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
      </svg>

      {/* Ana Kayan Çekmece Kartı */}
      <div
        ref={cardRef}
        className="max-h-[calc(100dvh-10.25rem)] overflow-y-auto rounded-2xl border border-slate-300/35 bg-gradient-to-b from-[#172133]/94 via-[#192336]/96 to-[#121A29]/97 backdrop-blur-xl shadow-[0_20px_54px_rgba(4,9,20,0.72)] p-4 text-slate-100"
      >
        {/* Üst Kaş & Kapat */}
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
            {pick('Station Info & Construction', 'İstasyon Bilgisi & İnşaat')}
          </p>
          <button
            type="button"
            onClick={() => {
              playClick()
              onClose()
            }}
            aria-label={pick('Close station panel', 'İstasyon panelini kapat')}
            className="w-6 h-6 rounded-full border border-slate-300/30 bg-[#0E1626]/75 text-slate-300 hover:text-white hover:border-slate-200 flex items-center justify-center text-sm leading-none cursor-pointer transition-colors shrink-0"
          >
            ×
          </button>
        </div>

        {/* İstasyon Adı + Önizleme Sprite */}
        <div className="mt-1.5 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-extrabold tracking-tight text-white leading-snug">
              {modName} ·{' '}
              <span className="text-cyan-300">
                {isMaxLevel
                  ? `${lvLabel} ${currentLevel} (${pick('Max', 'Maks.')})`
                  : `${lvLabel} ${currentLevel} → ${lvLabel} ${nextLevel}`}
              </span>
            </h2>
            <p className="text-xs text-slate-300/90 mt-0.5 leading-snug">{modDesc}</p>
          </div>

          <div className="w-[104px] h-[74px] rounded-xl border border-slate-300/35 bg-[#0C1424]/95 p-2 flex items-center justify-center shrink-0 shadow-inner overflow-hidden">
            <BuildingSprite
              moduleId={mod.id}
              level={isMaxLevel ? currentLevel : nextLevel}
              alt={modName}
              className="scale-[0.82]"
            />
          </div>
        </div>

        {/* Bilgi Kutusu */}
        <div className="mt-3 rounded-xl border border-slate-300/20 bg-[#101829]/75 px-3.5 py-2.5">
          <p className="text-[10px] font-bold uppercase tracking-[0.09em] text-slate-400 flex items-center gap-1.5">
            <span>{pick('What Does This Station Do?', 'Bu İstasyon Ne İşe Yarar?')}</span>
            <span
              aria-hidden="true"
              className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full border border-slate-400/50 text-[9px] text-slate-300 leading-none"
            >
              ?
            </span>
          </p>
          <p className="text-[12px] text-slate-100/95 leading-relaxed mt-1">
            {MODULE_HOW_IT_WORKS[lang][mod.id]}
          </p>
        </div>

        {/* Tamamlandığında Günlük Net Değişim */}
        {!isMaxLevel && (
          <div className="mt-2.5 rounded-xl border border-slate-300/20 bg-[#101829]/75 px-3.5 py-2.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.09em] text-slate-400 mb-2">
              {pick('Net Daily Change Upon Completion', 'Tamamlandığında Günlük Net Değişim')}
            </p>

            <div className="space-y-1.5">
              {netEffects.map((key) => {
                const before = beforeDelta[key] ?? 0
                const after = afterDelta[key] ?? 0
                const improved = after > before
                const worse = after < before
                return (
                  <div key={key} className="flex items-center justify-between gap-2 text-[12px]">
                    <span className="inline-flex items-center gap-1.5 font-semibold text-slate-200">
                      <span>{getResourceLabel(key, lang)}</span>
                      <ResourceIcon id={key} className="w-3.5 h-3.5 shrink-0" />
                    </span>

                    <span className="tabular-nums font-bold whitespace-nowrap">
                      <span className="text-slate-400">{formatSigned(before)}</span>
                      <span className="text-slate-500 mx-1">→</span>
                      <span
                        className={
                          improved
                            ? 'text-sky-300'
                            : worse
                              ? 'text-amber-300'
                              : 'text-slate-200'
                        }
                      >
                        {formatSigned(after)}
                      </span>
                      <span className="text-slate-300 font-semibold">/{pick('day', 'gün')}</span>
                    </span>
                  </div>
                )
              })}
            </div>

            {unlockedEventCount > 0 && (
              <p className="mt-2 pt-2 border-t border-slate-300/15 text-[11px] text-slate-200 leading-snug">
                <strong className="text-amber-300 font-bold">
                  {pick('New Unlock:', 'Yeni Kilit:')}
                </strong>{' '}
                {pick(
                  `${lvLabel} ${nextLevel} unlocks ${unlockedEventCount} new defensive option${unlockedEventCount > 1 ? 's' : ''} in events!`,
                  `${lvLabel} ${nextLevel} ile olaylarda ${unlockedEventCount} yeni savunma seçeneği açılır!`,
                )}
              </p>
            )}
          </div>
        )}

        {/* Ekip & İş Yükü / Devam Eden İnşaat */}
        {!isMaxLevel && activeBuild && (
          <div className="mt-2.5 rounded-xl border border-amber-300/35 bg-[#101829]/80 px-3.5 py-2.5 space-y-2">
            <div className="flex items-center justify-between text-[12px]">
              <span className="font-bold text-amber-300">
                {pick('Construction in Progress', 'İnşaat Devam Ediyor')}
              </span>
              <span className="font-semibold text-slate-200 tabular-nums whitespace-nowrap">
                {activeWorkDone} / {activeBuild.totalWork} {pick('work-days', 'iş günü')} ({activeProgressPct}%)
              </span>
            </div>

            <div className="h-2 rounded-full bg-[#090F1C] overflow-hidden border border-slate-300/20">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-cyan-400 transition-all duration-300"
                style={{ width: `${activeProgressPct}%` }}
              />
            </div>

            <div className="flex items-center justify-between gap-2 pt-0.5 text-[12px]">
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="text-slate-300">{pick('Crew:', 'Ekip:')}</span>
                <button
                  type="button"
                  disabled={disabled || activeBuild.assignedCrew <= 0}
                  onClick={() => {
                    playClick()
                    onAdjustCrew(mod.id, -1)
                  }}
                  aria-label={pick('Remove 1 astronaut from build', 'İnşaat ekibinden 1 astronot çıkar')}
                  className="w-6 h-6 shrink-0 rounded-full border border-slate-300/30 bg-[#1B263B] text-white font-bold flex items-center justify-center disabled:opacity-35 cursor-pointer"
                >
                  −
                </button>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#182235] border border-slate-300/20 font-bold tabular-nums text-white whitespace-nowrap shrink-0">
                  <AstronautBadgeIcon />
                  <span>× {activeBuild.assignedCrew}</span>
                </span>
                <button
                  type="button"
                  disabled={disabled || idleCrew <= 0}
                  onClick={() => {
                    playClick()
                    onAdjustCrew(mod.id, 1)
                  }}
                  aria-label={pick('Assign 1 astronaut to build', 'İnşaat ekibine 1 astronot ekle')}
                  className="w-6 h-6 shrink-0 rounded-full border border-slate-300/30 bg-[#1B263B] text-white font-bold flex items-center justify-center disabled:opacity-35 cursor-pointer"
                >
                  +
                </button>
              </div>

              <span className="rounded-md border border-slate-300/20 bg-[#182235] px-2.5 py-1 text-[11px] font-semibold text-amber-200 tabular-nums whitespace-nowrap shrink-0">
                {remainingActiveDays !== null
                  ? pick(`Remaining: ~${remainingActiveDays}d`, `Kalan: ~${remainingActiveDays} gün`)
                  : pick('Paused', 'Beklemede')}
              </span>
            </div>
          </div>
        )}

        {!isMaxLevel && !activeBuild && (
          <div className="mt-2.5 rounded-xl border border-slate-300/20 bg-[#101829]/75 px-3.5 py-2.5 space-y-2">
            <div className="flex items-center justify-between gap-2 text-[12px]">
              <span className="text-slate-300 whitespace-nowrap">
                {pick('Total Workload:', 'Toplam İş Yükü:')}{' '}
                <strong className="text-amber-300 font-bold">
                  {workCost} {pick('work-days', 'iş günü')}
                </strong>
              </span>
              <span className="text-slate-300 whitespace-nowrap">
                {pick('Idle Astronauts:', 'Boşta Astronot:')}{' '}
                <strong
                  className={`font-bold tabular-nums ${
                    hasIdleCrew ? 'text-white' : 'text-rose-300'
                  }`}
                >
                  {idleCrew} / {crewCount}
                </strong>
              </span>
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-[11.5px] whitespace-nowrap">
                <span className="text-slate-300">{pick('Assign Crew:', 'Atanacak Ekip:')}</span>
                <button
                  type="button"
                  disabled={!hasIdleCrew || assignableCrew <= 1}
                  onClick={() => {
                    playClick()
                    setSelectedCrew((prev) => Math.max(1, prev - 1))
                  }}
                  aria-label={pick('Decrease assigned astronauts', 'Atanacak astronot sayısını azalt')}
                  className="w-6 h-6 shrink-0 rounded-full border border-slate-300/30 bg-[#1B263B] hover:bg-[#24324D] text-white font-bold flex items-center justify-center disabled:opacity-35 cursor-pointer transition-colors"
                >
                  −
                </button>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#182235] border border-slate-300/20 font-bold tabular-nums text-white whitespace-nowrap shrink-0">
                  <AstronautBadgeIcon />
                  <span>× {assignableCrew}</span>
                </span>
                <button
                  type="button"
                  disabled={!hasIdleCrew || assignableCrew >= idleCrew}
                  onClick={() => {
                    playClick()
                    setSelectedCrew((prev) => Math.min(idleCrew, prev + 1))
                  }}
                  aria-label={pick('Increase assigned astronauts', 'Atanacak astronot sayısını artır')}
                  className="w-6 h-6 shrink-0 rounded-full border border-slate-300/30 bg-[#1B263B] hover:bg-[#24324D] text-white font-bold flex items-center justify-center disabled:opacity-35 cursor-pointer transition-colors"
                >
                  +
                </button>
              </div>

              <span className="rounded-md border border-slate-300/20 bg-[#182235] px-2.5 py-1 text-[11px] font-semibold text-slate-100 tabular-nums whitespace-nowrap shrink-0">
                {pick('ETA:', 'Tamamlanma:')}{' '}
                {assignableCrew > 0
                  ? `${estimatedDays} ${pick('days', 'gün')}`
                  : pick('Crew needed', 'Ekip gerekli')}
              </span>
            </div>
          </div>
        )}

        {/* Maliyet & Bütçe + Alt Eylem Butonları */}
        <div className="mt-3 pt-0.5 space-y-2.5">
          {!isMaxLevel && (
            <div className="flex items-center justify-between text-[12px] px-0.5">
              <span className="text-slate-300">
                {pick('Cost:', 'Maliyet:')}{' '}
                <strong className="text-amber-300 font-bold">
                  {upgradeCost} {pick('pts', 'puan')}
                </strong>
              </span>
              <span className="text-slate-300">
                {pick('Budget:', 'Bütçe:')}{' '}
                <strong
                  className={`font-bold tabular-nums ${
                    canAfford ? 'text-white' : 'text-rose-300'
                  }`}
                >
                  {budget} {pick('pts', 'puan')}
                </strong>
              </span>
            </div>
          )}

          {isMaxLevel ? (
            <button
              type="button"
              onClick={() => {
                playClick()
                onClose()
              }}
              className="w-full min-h-10 rounded-xl border border-slate-300/35 bg-[#1B263B]/90 hover:bg-[#24324D] text-xs font-bold text-slate-100 cursor-pointer transition-colors"
            >
              {pick('Close (Max Level)', 'Kapat (Maksimum Seviye)')}
            </button>
          ) : (
            <div className="grid grid-cols-[1fr_1.35fr] gap-2.5">
              <button
                type="button"
                onClick={() => {
                  playClick()
                  onClose()
                }}
                className="min-h-10 rounded-xl border border-slate-300/35 bg-[#1B263B]/90 hover:bg-[#24324D] text-xs font-bold text-slate-100 cursor-pointer transition-colors"
              >
                {activeBuild ? pick('Close', 'Kapat') : pick('Cancel', 'Vazgeç')}
              </button>
              <button
                type="button"
                disabled={!canStart}
                onClick={() => {
                  playClick()
                  onStartBuild(mod.id, assignableCrew)
                }}
                className={`min-h-10 rounded-xl text-xs font-extrabold transition-colors px-3 ${
                  canStart
                    ? 'bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-[0_0_20px_rgba(34,211,238,0.28)] cursor-pointer'
                    : 'border border-slate-500/25 bg-[#1A2436]/80 text-slate-400 cursor-not-allowed'
                }`}
              >
                {startButtonLabel}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function UpgradeModal({
  moduleId,
  modulesDef,
  levels,
  resources,
  day,
  budget,
  crewCount,
  idleCrew,
  activeBuild,
  disabled,
  onStartBuild,
  onAdjustCrew,
  onClose,
}: UpgradeModalProps) {
  const mod = moduleId ? modulesDef.find((item) => item.id === moduleId) ?? null : null
  if (!mod) return null

  return (
    <UpgradePanelContent
      key={mod.id}
      mod={mod}
      levels={levels}
      resources={resources}
      day={day}
      budget={budget}
      crewCount={crewCount}
      idleCrew={idleCrew}
      activeBuild={activeBuild}
      disabled={disabled}
      onStartBuild={onStartBuild}
      onAdjustCrew={onAdjustCrew}
      onClose={onClose}
    />
  )
}
