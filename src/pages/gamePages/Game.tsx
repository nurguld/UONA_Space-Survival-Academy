import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Card from '../../components/Card'
import BaseScene from '../../components/BaseScene'
import UpgradeModal from '../../components/UpgradeModal'
import EventModal from '../../components/EventModal'
import LogbookModal from '../../components/LogbookModal'
import CrewTasksDrawer, { AstronautHelmetIcon } from '../../components/CrewTasksDrawer'
import MissionSetupModal from '../../components/MissionSetupModal'
import IntroModal from '../../components/IntroModal'
import DaySummaryModal from '../../components/DaySummaryModal'
import type { DaySummaryData } from '../../components/DaySummaryModal'
import LanguageToggle from '../../components/LanguageToggle'
import {
  DayTransitionCutscene,
  LaunchCutscene,
  VictoryCutscene,
} from '../../components/MissionCutscenes'
import { RESOURCE_ORDER, ResourceIcon } from '../../components/ResourceIcon'
import { useGame } from '../../context/GameContext'
import { useLanguage } from '../../context/LanguageContext'
import {
  analyzeLossReason,
  calculateDailyBreakdown,
  calculateDailyDelta,
  calculateSystemEffects,
  getDifficultyInfo,
  getIdleCrewCount,
  isLunarNight,
} from '../../game/engine'
import {
  formatUpgradeLabel,
  getResourceLabel,
  getResourceShortLabel,
  localizeEvent,
} from '../../i18n/gameTranslations'
import {
  getSoundMuted,
  playAlert,
  playBookPage,
  playClick,
  playLose,
  playModuleOpen,
  playNextDay,
  playSignal,
  playUpgrade,
  playUpgradeComplete,
  playWin,
  preloadGameSounds,
  setSoundMuted,
} from '../../game/sound'
import type { ModuleId, ResourceId, SceneNavigationHandle } from '../../types'

type IntroPhase = 'setup' | 'story' | 'launching' | 'done'

const PILL_THEME_MAP: Record<ResourceId, { shell: string; valueClass: string }> = {
  energy: {
    shell: 'border-amber-400/35 bg-[#24211D]/88',
    valueClass: 'text-amber-300',
  },
  oxygen: {
    shell: 'border-sky-400/35 bg-[#152338]/88',
    valueClass: 'text-sky-300',
  },
  food: {
    shell: 'border-emerald-400/35 bg-[#122626]/88',
    valueClass: 'text-emerald-300',
  },
  radiation: {
    shell: 'border-orange-400/35 bg-[#251D1B]/88',
    valueClass: 'text-orange-300',
  },
  health: {
    shell: 'border-violet-400/40 bg-[#1F1C36]/90',
    valueClass: 'text-violet-300',
  },
}

export default function Game() {
  const {
    state,
    rules,
    startGame,
    startBuild,
    adjustBuildCrew,
    nextDay,
    resolveEvent,
  } = useGame()
  const { lang, pick } = useLanguage()

  const [selectedModuleId, setSelectedModuleId] = useState<ModuleId | null>(null)
  const [isLogOpen, setIsLogOpen] = useState(false)
  const [isCrewOpen, setIsCrewOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const sceneNavRef = useRef<SceneNavigationHandle | null>(null)
  const [introPhase, setIntroPhase] = useState<IntroPhase>(() =>
    state.day === 1 &&
    state.history.length === 1 &&
    state.history[0]?.upgrades.length === 0 &&
    Object.keys(state.activeBuilds).length === 0
      ? 'setup'
      : 'done',
  )
  const [daySummary, setDaySummary] = useState<DaySummaryData | null>(null)
  const [dayTransitionDay, setDayTransitionDay] = useState<number | null>(null)
  const [showVictoryCutscene, setShowVictoryCutscene] = useState(false)
  const [focusHintModuleId, setFocusHintModuleId] = useState<ModuleId | null>(null)
  const [muted, setMuted] = useState(() => getSoundMuted())

  useEffect(() => {
    preloadGameSounds()
  }, [])

  const prevRef = useRef({
    status: state.status,
    eventId: state.activeEvent?.id ?? null,
    day: state.day,
    resources: state.resources,
    modules: state.modules,
    isNight: isLunarNight(state.day),
  })

  // Gün atlandığında gün sonu değerlendirme penceresini aç ve ses/animasyonları senkronize et
  useEffect(() => {
    const prev = prevRef.current
    const isDayAdvancing = state.day > prev.day && state.status === 'playing'

    if (isDayAdvancing) {
      const completedBuildItems = rules.modules
        .filter((mod) => state.modules[mod.id] > prev.modules[mod.id])
        .map((mod) => ({
          moduleId: mod.id,
          prevLevel: prev.modules[mod.id],
          targetLevel: state.modules[mod.id],
        }))
      const completedBuilds = completedBuildItems.map((item) => formatUpgradeLabel(item, lang))

      if (completedBuilds.length > 0) {
        playUpgradeComplete()
      }

      setDaySummary({
        day: prev.day,
        isNight: prev.isNight,
        before: prev.resources,
        after: state.resources,
        completedBuilds,
        completedBuildItems,
      })
      setFocusHintModuleId(null)
    }

    const visibleEventId =
      introPhase === 'done' &&
      !isDayAdvancing &&
      !daySummary &&
      dayTransitionDay === null &&
      !showVictoryCutscene
        ? (state.activeEvent?.id ?? null)
        : null

    if (state.status === 'won' && prev.status !== 'won') {
      setDaySummary(null)
      setDayTransitionDay(null)
      setShowVictoryCutscene(true)
      playWin()
    } else if (state.status === 'lost' && prev.status !== 'lost') {
      setDaySummary(null)
      setDayTransitionDay(null)
      playLose()
    } else if (visibleEventId && visibleEventId !== prev.eventId) {
      if (state.activeEvent?.kind === 'earth') {
        playSignal()
      } else {
        playAlert()
      }
    }

    prevRef.current = {
      status: state.status,
      eventId: visibleEventId,
      day: state.day,
      resources: state.resources,
      modules: state.modules,
      isNight: isLunarNight(state.day),
    }
  }, [
    state.status,
    state.activeEvent,
    state.day,
    state.resources,
    state.modules,
    rules.modules,
    introPhase,
    daySummary,
    dayTransitionDay,
    showVictoryCutscene,
    lang,
  ])

  const handleToggleMute = () => {
    const next = !muted
    setMuted(next)
    setSoundMuted(next)
    if (!next) playClick()
  }

  const handleRestart = () => {
    playClick()
    setDaySummary(null)
    setDayTransitionDay(null)
    setShowVictoryCutscene(false)
    setFocusHintModuleId(null)
    setSelectedModuleId(null)
    startGame()
    setIntroPhase('setup')
  }

  const handleStartBuild = (moduleId: ModuleId, assignCrew: number) => {
    playUpgrade()
    startBuild(moduleId, assignCrew)
    if (focusHintModuleId === moduleId) {
      setFocusHintModuleId(null)
    }
  }

  const handleAdjustCrew = (moduleId: ModuleId, deltaCrew: number) => {
    playClick()
    adjustBuildCrew(moduleId, deltaCrew)
  }

  const handleSelectEventOption = (optionIndex: number) => {
    const chosenFocus = state.activeEvent?.options[optionIndex]?.focusModuleId ?? null
    playClick()
    resolveEvent(optionIndex)
    if (chosenFocus) {
      setFocusHintModuleId(chosenFocus)
    }
  }

  const handleCloseDaySummary = () => {
    playClick()
    setDaySummary(null)
    setDayTransitionDay(state.day)
  }

  const idleCrew = getIdleCrewCount(state)
  const dailyDelta = calculateDailyDelta(
    state.modules,
    state.day,
    state.resources,
    state.crewCount,
  )
  const dailyBreakdown = calculateDailyBreakdown(
    state.modules,
    state.day,
    state.resources,
    state.crewCount,
    lang,
  )
  const { interactions } = calculateSystemEffects(state.resources, lang)
  const isPlaying = state.status === 'playing'

  const highlightedModuleId = focusHintModuleId
  const isCutsceneActive =
    introPhase !== 'done' || dayTransitionDay !== null || showVictoryCutscene
  const visibleEvent =
    isCutsceneActive || daySummary || !state.activeEvent
      ? null
      : localizeEvent(state.activeEvent, lang)
  const controlsLocked =
    !isPlaying || state.activeEvent !== null || daySummary !== null || isCutsceneActive

  const night = isLunarNight(state.day)
  const daysUntilNight = rules.lunarNightStartDay - state.day

  return (
    <div className="relative w-full h-dvh min-h-[580px] overflow-hidden bg-[#040814] text-white">
      {/* Tam Ekran Ay Üssü Sahnesi */}
      <div className="absolute inset-0 z-0">
        <BaseScene
          day={state.day}
          maxDays={rules.maxDays}
          lunarNightStartDay={rules.lunarNightStartDay}
          modules={state.modules}
          modulesDef={rules.modules}
          activeBuilds={state.activeBuilds}
          budget={state.budget}
          disabled={controlsLocked}
          highlightedModuleId={highlightedModuleId}
          viewMode="map"
          hideHeader
          navigationRef={sceneNavRef}
          onSelectModule={(id) => {
            playModuleOpen(id)
            setIsCrewOpen(false)
            setIsLogOpen(false)
            setIsSettingsOpen(false)
            setSelectedModuleId(id)
          }}
        />
      </div>

      {/* Üst Yüzen Kontrol Çubuğu (Başlık + 5 Kaynak Kapsülü + Ayarlar) */}
      <header className="absolute top-3 inset-x-3 sm:inset-x-4 z-[950] rounded-2xl border border-slate-300/30 bg-gradient-to-b from-[#172133]/92 to-[#121A29]/95 backdrop-blur-xl px-3.5 sm:px-4 py-2 shadow-[0_10px_34px_rgba(4,9,20,0.55)]">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          {/* Sol: Başlık ve Bütçe + Gün */}
          <div className="min-w-0">
            <h1 className="text-base sm:text-xl font-bold tracking-tight leading-tight text-white">
              {pick('Lunar Base Control Panel', 'Ay Üssü Kontrol Paneli')}
            </h1>
            <div className="flex flex-wrap items-center gap-x-2 text-[11px] sm:text-xs text-slate-300 mt-0.5">
              <span>
                {pick('Budget:', 'Bütçe:')}{' '}
                <strong className="text-cyan-300 font-bold">
                  {pick(`${state.budget} pts`, `${state.budget} puan`)}
                </strong>
                {' · '}+{rules.dailyBudgetGain}/{pick('day', 'gün')}
              </span>
              <span className="text-white/25">·</span>
              <span className="font-semibold text-amber-300">
                {pick(`Day ${state.day}/${rules.maxDays}`, `Gün ${state.day}/${rules.maxDays}`)}
              </span>
              <span className="text-white/25">·</span>
              <span className={night ? 'text-indigo-300' : 'text-amber-200'}>
                {night
                  ? pick('🌙 Lunar Night', '🌙 Ay Gecesi')
                  : pick('☀️ Lunar Day', '☀️ Ay Gündüzü')}
              </span>
            </div>
          </div>

          {/* Orta & Sağ: 5 Kaynak Kapsülü + Ayarlar */}
          <div className="flex flex-wrap items-center gap-2">
            {RESOURCE_ORDER.map((resId) => {
              const val = Math.max(0, Math.min(100, state.resources[resId]))
              const delta = dailyDelta[resId]
              const isDanger = val < 30
              const theme = PILL_THEME_MAP[resId]
              const pillLabel =
                resId === 'health'
                  ? getResourceShortLabel(resId, lang)
                  : getResourceLabel(resId, lang)
              const deltaText = delta > 0 ? `+${delta}` : String(delta)
              const deltaClass =
                delta > 0 ? 'text-emerald-300' : delta < 0 ? 'text-rose-300' : 'text-slate-300/80'

              return (
                <div
                  key={resId}
                  title={dailyBreakdown[resId]}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs backdrop-blur-md transition-colors ${
                    isDanger ? 'border-rose-400/75 bg-rose-950/65 text-rose-100' : theme.shell
                  }`}
                >
                  <ResourceIcon id={resId} className="w-3.5 h-3.5 shrink-0" />
                  <span className="text-slate-100 font-medium truncate max-w-[96px]">
                    {pillLabel}:
                  </span>
                  <span
                    className={`font-bold tabular-nums ${
                      isDanger ? 'text-rose-200' : theme.valueClass
                    }`}
                  >
                    {val}
                  </span>
                  <span className={`font-semibold tabular-nums ${deltaClass}`}>({deltaText})</span>
                </div>
              )
            })}

            {/* Ayarlar Dişli Menüsü */}
            <div className="relative">
              <button
                type="button"
                aria-label={pick('Game Settings & Menu', 'Oyun Ayarları ve Menü')}
                aria-expanded={isSettingsOpen}
                onClick={() => {
                  playClick()
                  setIsSettingsOpen((prev) => !prev)
                }}
                className="w-10 h-10 rounded-xl border border-white/25 bg-white/5 hover:bg-white/15 hover:border-white/55 text-slate-200 flex items-center justify-center cursor-pointer transition-colors"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065Z"
                  />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>

              {isSettingsOpen && (
                <div className="absolute right-0 mt-2 w-60 rounded-2xl border border-white/25 bg-[#081024]/96 backdrop-blur-xl p-2.5 shadow-[0_12px_36px_rgba(0,0,0,0.7)] flex flex-col gap-1.5 text-xs">
                  <div className="px-2 py-1 text-[11px] text-slate-400 flex items-center justify-between border-b border-white/10 pb-1.5">
                    <span>{pick('Difficulty', 'Zorluk')}</span>
                    <strong className="text-slate-100">
                      {getDifficultyInfo(state.difficulty, lang).label}
                    </strong>
                  </div>

                  <button
                    type="button"
                    aria-pressed={muted}
                    onClick={handleToggleMute}
                    className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-white/10 text-slate-100 font-medium cursor-pointer transition-colors"
                  >
                    {muted
                      ? pick('🔇 Sound Off (Unmute)', '🔇 Ses Kapalı (Aç)')
                      : pick('🔊 Sound On (Mute)', '🔊 Ses Açık (Kapat)')}
                  </button>

                  <LanguageToggle variant="menu" />

                  <button
                    type="button"
                    onClick={() => {
                      setIsSettingsOpen(false)
                      handleRestart()
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-rose-500/20 text-rose-200 font-medium cursor-pointer transition-colors"
                  >
                    {pick('🔄 Reset Mission', '🔄 Görevi Sıfırla')}
                  </button>

                  <div className="border-t border-white/10 pt-1.5 flex items-center justify-between gap-1">
                    <Link
                      to="/"
                      className="flex-1 text-center py-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-200"
                    >
                      {pick('Home', 'Ana sayfa')}
                    </Link>
                    <Link
                      to="/hazirlik"
                      className="flex-1 text-center py-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-200"
                    >
                      {pick('Briefing', 'Brifing')}
                    </Link>
                    <Link
                      to="/kaynaklar"
                      className="flex-1 text-center py-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-200"
                    >
                      {pick('Resources', 'Kaynaklar')}
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Sol Üst Yüzen Sistem Etkileşimleri */}
      {(interactions.length > 0 || night || (daysUntilNight > 0 && daysUntilNight <= 4)) && (
        <div
          aria-label={pick('System Interactions', 'Sistem Etkileşimleri')}
          className="pointer-events-none absolute top-[5.5rem] sm:top-[4.85rem] left-3 sm:left-4 z-[945] flex flex-col items-start gap-1.5 max-w-[min(92vw,28rem)]"
        >
          {(night || (daysUntilNight > 0 && daysUntilNight <= 4)) && (
            <span
              className={`text-[11px] font-semibold px-3 py-1 rounded-full border backdrop-blur-md shadow ${
                night && state.modules.battery > 0
                  ? 'border-emerald-400/50 bg-[#081A1F]/85 text-emerald-200'
                  : 'border-orange-400/60 bg-[#1F120E]/85 text-orange-200'
              }`}
            >
              {night
                ? state.modules.battery > 0
                  ? pick(
                      `🌙 Lunar Night · Battery active (+${(rules.modules.find((m) => m.id === 'battery')?.perDay.energy ?? 5) * state.modules.battery}/day)`,
                      `🌙 Ay Gecesi · Batarya devrede (+${(rules.modules.find((m) => m.id === 'battery')?.perDay.energy ?? 5) * state.modules.battery}/gün)`,
                    )
                  : pick(
                      '🌙 Lunar Night · Solar panels offline (No battery!)',
                      '🌙 Ay Gecesi · Güneş panelleri kapalı (Batarya yok!)',
                    )
                : pick(
                    `⚠️ Lunar Night in ${daysUntilNight} days`,
                    `⚠️ Ay gecesine ${daysUntilNight} gün kaldı`,
                  )}
            </span>
          )}

          {interactions.map((item) => (
            <span
              key={item.text}
              className={`text-[11px] font-medium px-3 py-1 rounded-full border backdrop-blur-md shadow ${
                item.severity === 'good'
                  ? 'border-emerald-400/45 bg-[#0A1B1C]/82 text-emerald-200'
                  : item.severity === 'danger'
                    ? 'border-rose-400/50 bg-[#1D0F16]/82 text-rose-200'
                    : 'border-amber-400/45 bg-[#19140E]/82 text-amber-200'
              }`}
            >
              {item.text}
            </span>
          ))}
        </div>
      )}

      {/* Sağ Orta Mürettebat & Görevler Açma Butonu */}
      <button
        type="button"
        data-crew-toggle="true"
        aria-expanded={isCrewOpen}
        aria-label={
          isCrewOpen
            ? pick('Close Crew & Tasks Panel', 'Ekip ve Görevler Panelini Kapat')
            : pick('Open Crew & Tasks Panel', 'Ekip ve Görevler Panelini Aç')
        }
        title={pick(
          `Idle astronauts: ${idleCrew} / Total: ${state.crewCount} · Click to manage tasks`,
          `Boşta astronot: ${idleCrew} / Toplam: ${state.crewCount} · Tıkla ve görevleri yönet`,
        )}
        onClick={() => {
          playClick()
          setSelectedModuleId(null)
          setIsLogOpen(false)
          setIsSettingsOpen(false)
          setIsCrewOpen((prev) => !prev)
        }}
        className={`absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-[945] rounded-xl border px-3 py-2 backdrop-blur-md shadow-[0_6px_22px_rgba(0,0,0,0.45)] flex items-center gap-2 cursor-pointer transition-all ${
          isCrewOpen
            ? 'border-cyan-300 bg-[#142344] shadow-[0_0_18px_rgba(56,189,248,0.35)]'
            : 'border-white/25 bg-[#09132A]/88 hover:border-cyan-300/65 hover:bg-[#101E3D]'
        }`}
      >
        <AstronautHelmetIcon className="w-6 h-6 shrink-0" />
        <span className="text-sm sm:text-base font-extrabold text-white tabular-nums">
          {idleCrew} / {state.crewCount}
        </span>
        {Object.keys(state.activeBuilds).length > 0 && (
          <span
            aria-hidden="true"
            className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)]"
          />
        )}
      </button>

      {/* Görev Sonu Yüzen Sonuç Kartı */}
      {!isPlaying && (
        <div className="absolute inset-x-4 top-28 z-[955] mx-auto max-w-2xl">
          <Card
            className={`rounded-2xl bg-[#081024]/94 backdrop-blur-xl ${
              state.status === 'won' ? 'border-emerald-400' : 'border-orange-400'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="max-w-lg">
                <h2 className="text-xl sm:text-2xl font-bold">
                  {state.status === 'won'
                    ? pick('Congratulations! Survived 30 Days!', 'Tebrikler! 30 Gün Hayatta Kaldın!')
                    : pick(
                        `Mission Failed (Day ${state.day} · ${
                          state.lossReason ? getResourceLabel(state.lossReason, lang) : 'Critical Loss'
                        })`,
                        `Görev Başarısız (${state.day}. Gün · ${
                          state.lossReason ? getResourceLabel(state.lossReason, lang) : 'Kritik Kayıp'
                        })`,
                      )}
                </h2>
                <p className="text-slate-200 text-sm mt-1.5 leading-relaxed">
                  {state.status === 'won'
                    ? pick(
                        'Your lunar base crew successfully overcame every mission challenge.',
                        'Ay üssü mürettebatı tüm zorlukları başarıyla yönetti.',
                      )
                    : analyzeLossReason(state, lang)}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleRestart}
                  className="px-5 min-h-11 rounded-xl text-sm font-bold bg-cyan-400 text-slate-950 cursor-pointer"
                >
                  {pick('Play Again', 'Tekrar Oyna')}
                </button>
                <Link
                  to="/sonuc"
                  className="px-5 min-h-11 rounded-xl text-sm font-semibold inline-flex items-center border border-white/25 text-white hover:border-white"
                >
                  {pick('Result Screen', 'Sonuç Ekranı')}
                </Link>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Sağ Alt Kontrol Satırı: Günlük Kitabı & Günü Bitir */}
      <div className="pointer-events-none absolute bottom-3 right-3 sm:right-4 z-[945] flex items-end justify-end gap-2.5">
        <div className="pointer-events-auto flex items-end gap-2.5 shrink-0">
          <button
            type="button"
            data-logbook-toggle="true"
            aria-expanded={isLogOpen}
            onClick={() => {
              if (isLogOpen) {
                playClick()
              } else {
                playBookPage()
              }
              setSelectedModuleId(null)
              setIsCrewOpen(false)
              setIsSettingsOpen(false)
              setIsLogOpen((prev) => !prev)
            }}
            aria-label={
              isLogOpen
                ? pick('Close Mission Logbook', 'Görev Günlüğünü Kapat')
                : pick('Open Mission Logbook', 'Görev Günlüğünü Aç')
            }
            title={pick(
              `Base Logbook (${state.history.length} entries)`,
              `Üs Günlüğü (${state.history.length} kayıt)`,
            )}
            className={`relative group w-12 h-12 rounded-xl border backdrop-blur-md shadow-lg flex items-center justify-center cursor-pointer transition-all ${
              isLogOpen
                ? 'border-amber-300 bg-[#132247] shadow-[0_0_16px_rgba(251,191,36,0.35)]'
                : 'border-white/25 bg-[#09132A]/88 hover:border-amber-300/75 hover:bg-[#0F1B38]'
            }`}
          >
            <svg aria-hidden="true" viewBox="0 0 36 38" className="w-8 h-8 group-hover:scale-105 transition-transform">
              <rect x="6" y="4" width="24" height="30" rx="3" fill="#8B5E3C" stroke="#1E293B" strokeWidth="2.2" />
              <rect x="6" y="4" width="6" height="30" rx="2" fill="#5C3D28" stroke="#1E293B" strokeWidth="2" />
              <rect x="15" y="12" width="10" height="8" rx="1.5" fill="#FDE68A" stroke="#1E293B" strokeWidth="1.4" />
              <circle cx="20" cy="16" r="2.2" fill="#38BDF8" stroke="#1E293B" strokeWidth="1.1" />
              <rect x="14" y="34" width="5" height="3" fill="#EF4444" />
            </svg>
            <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full bg-slate-950 border border-white/40 text-[10px] font-extrabold text-amber-300 flex items-center justify-center shadow">
              {state.history.length}
            </span>
          </button>

          <button
            type="button"
            disabled={controlsLocked}
            onClick={() => {
              playNextDay()
              nextDay()
            }}
            className="px-5 sm:px-6 h-12 rounded-xl text-sm sm:text-base font-extrabold uppercase tracking-wide bg-gradient-to-r from-[#0EA5D9] to-[#22C9EB] text-white shadow-[0_0_26px_rgba(34,211,238,0.5)] hover:brightness-110 disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer transition-all"
          >
            {pick('End Day →', 'Günü Bitir →')}
          </button>
        </div>
      </div>

      {/* 1. Adım: Mürettebat ve Zorluk Seçimi Penceresi */}
      <MissionSetupModal
        isOpen={introPhase === 'setup'}
        initialCrewCount={state.crewCount}
        initialDifficulty={state.difficulty}
        onConfirm={(setup) => {
          playClick()
          startGame(setup)
          setIntroPhase('story')
        }}
      />

      {/* 2. Adım: Eski Giriş Hikâyesi Penceresi */}
      <IntroModal
        isOpen={introPhase === 'story'}
        onStart={() => {
          playClick()
          setIntroPhase('launching')
        }}
      />

      {/* 3. Adım: Dünya'dan Fırlatma & Ay'a İniş Animasyonu */}
      <LaunchCutscene
        isOpen={introPhase === 'launching'}
        crewCount={state.crewCount}
        onComplete={() => setIntroPhase('done')}
      />

      {/* Gün Sonu Değerlendirme Penceresi */}
      <DaySummaryModal summary={daySummary} onClose={handleCloseDaySummary} />

      {/* Rapordan Sonra Gelen Kısa Gün Geçiş Animasyonu */}
      <DayTransitionCutscene
        targetDay={dayTransitionDay}
        lunarNightStartDay={rules.lunarNightStartDay}
        lunarNightEndDay={rules.lunarNightEndDay}
        onComplete={() => setDayTransitionDay(null)}
      />

      {/* 30. Gün Zafer Kutlama Animasyonu */}
      <VictoryCutscene
        isOpen={showVictoryCutscene}
        crewCount={state.crewCount}
        onContinue={() => {
          playClick()
          setShowVictoryCutscene(false)
        }}
      />

      {/* Modül Bilgi, İnşaat & Astronot Atama Penceresi */}
      <UpgradeModal
        moduleId={selectedModuleId}
        modulesDef={rules.modules}
        levels={state.modules}
        resources={state.resources}
        day={state.day}
        budget={state.budget}
        crewCount={state.crewCount}
        idleCrew={idleCrew}
        activeBuild={selectedModuleId ? state.activeBuilds[selectedModuleId] : undefined}
        disabled={controlsLocked}
        onStartBuild={handleStartBuild}
        onAdjustCrew={handleAdjustCrew}
        onClose={() => setSelectedModuleId(null)}
      />

      {/* Dünya'dan Mesaj / Olay Karar Penceresi */}
      <EventModal
        event={visibleEvent}
        modules={state.modules}
        modulesDef={rules.modules}
        onSelect={handleSelectEventOption}
      />

      {/* Görev Günlüğü Penceresi */}
      <LogbookModal
        isOpen={isLogOpen}
        history={state.history}
        onClose={() => setIsLogOpen(false)}
      />

      {/* Ekip & Görevler Sağ Açılır Çekmece */}
      <CrewTasksDrawer
        isOpen={isCrewOpen}
        crewCount={state.crewCount}
        idleCrew={idleCrew}
        budget={state.budget}
        modules={state.modules}
        modulesDef={rules.modules}
        activeBuilds={state.activeBuilds}
        disabled={controlsLocked}
        onSelectModule={(id) => sceneNavRef.current?.walkToModule(id)}
        onClose={() => setIsCrewOpen(false)}
      />
    </div>
  )
}
