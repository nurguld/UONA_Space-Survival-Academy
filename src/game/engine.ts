import type {
  ActiveBuild,
  DayLog,
  DifficultyLevel,
  EventOption,
  GameEvent,
  GameState,
  MissionSetup,
  ModuleDef,
  ModuleId,
  ModuleLevels,
  ResourceId,
  Resources,
  RulesConfig,
  TutorialStep,
  UpgradeLogItem,
} from '../types'
import type { Language } from '../context/LanguageContext'
import { DIFFICULTY_TEXTS, getModuleName } from '../i18n/gameTranslations'

import rulesData from '../data/rules.json'
import eventsData from '../data/events.json'
import tutorialData from '../data/tutorial.json'
import earthMessagesData from '../data/earthMessages.json'

interface EarthMessageRecord extends GameEvent {
  day: number
}

export const RULES = rulesData as RulesConfig
export const EVENTS = eventsData as GameEvent[]
export const TUTORIAL = tutorialData as TutorialStep[]
export const EARTH_MESSAGES = earthMessagesData as EarthMessageRecord[]

export const DIFFICULTY_CONFIG: Record<
  DifficultyLevel,
  { label: string; startingBudget: number; eventChance: number; summary: string }
> = {
  easy: {
    label: 'Kolay',
    startingBudget: 6,
    eventChance: 0.3,
    summary: '6 başlangıç puanı · daha sakin uzay koşulları',
  },
  normal: {
    label: 'Normal',
    startingBudget: 4,
    eventChance: 0.45,
    summary: '4 başlangıç puanı · dengeli Ay üssü deneyimi',
  },
  hard: {
    label: 'Zor',
    startingBudget: 2,
    eventChance: 0.6,
    summary: '2 başlangıç puanı · daha sık uzay fırtınası',
  },
}

const RESOURCE_IDS: ResourceId[] = ['energy', 'oxygen', 'food', 'radiation', 'health']

const BASE_DRAIN_LABELS: Record<Language, Record<ResourceId, string>> = {
  en: {
    energy: 'Base core',
    oxygen: 'Crew breathing',
    food: 'Crew rations',
    radiation: 'Solar radiation',
    health: 'Daily fatigue',
  },
  tr: {
    energy: 'Üs temel',
    oxygen: 'Mürettebat solunum',
    food: 'Mürettebat tüketimi',
    radiation: 'Güneş radyasyonu',
    health: 'Günlük yorgunluk',
  },
}

export function getDifficultyInfo(difficulty: DifficultyLevel, lang: Language = 'en') {
  return {
    ...DIFFICULTY_CONFIG[difficulty],
    ...DIFFICULTY_TEXTS[difficulty][lang],
  }
}

export function isLunarNight(day: number): boolean {
  return day >= RULES.lunarNightStartDay && day <= RULES.lunarNightEndDay
}

export function getModuleWorkCost(mod: ModuleDef): number {
  return mod.workDays ?? 3
}

export function getAssignedCrewCount(
  activeBuilds: Partial<Record<ModuleId, ActiveBuild>>,
): number {
  let total = 0
  for (const build of Object.values(activeBuilds)) {
    if (build) {
      total += build.assignedCrew
    }
  }
  return total
}

export function getIdleCrewCount(state: GameState): number {
  return Math.max(0, state.crewCount - getAssignedCrewCount(state.activeBuilds))
}

export function getEffectiveBaseDrain(crewCount: number): Resources {
  const count = Math.max(1, Math.min(4, Math.round(crewCount)))
  // 3 astronotta varsayılan tüketim (-8 oksijen, -7 gıda) korunur; her kişi ±2 tüketim etkiler
  return {
    ...RULES.baseDailyDrain,
    oxygen: -(2 + count * 2),
    food: -(1 + count * 2),
  }
}

export function createInitialState(setup?: Partial<MissionSetup>): GameState {
  const crewCount = Math.max(1, Math.min(4, Math.round(setup?.crewCount ?? 3)))
  const difficulty: DifficultyLevel =
    setup?.difficulty && setup.difficulty in DIFFICULTY_CONFIG ? setup.difficulty : 'normal'

  return {
    day: 1,
    crewCount,
    difficulty,
    resources: { ...RULES.initialResources },
    modules: { ...RULES.initialModules },
    activeBuilds: {},
    budget: DIFFICULTY_CONFIG[difficulty].startingBudget,
    status: 'playing',
    activeEvent: null,
    lastDelta: null,
    lossReason: null,
    history: [{ day: 1, isNight: isLunarNight(1), upgrades: [] }],
  }
}

export interface SystemInteraction {
  text: string
  severity: 'good' | 'warn' | 'danger'
}

interface EffectPart {
  label: string
  value: number
}

function getRadiationHealthPenalty(radiation: number): number {
  if (radiation >= 100) return 0
  if (radiation >= 75) return -1
  if (radiation >= 50) return -3
  if (radiation >= 25) return -5
  return -8
}

function evaluateSystemEffects(
  resources: Resources,
  lang: Language = 'en',
): {
  effects: Partial<Resources>
  interactions: SystemInteraction[]
  contributions: Record<ResourceId, EffectPart[]>
} {
  const isEn = lang === 'en'
  const effects: Partial<Resources> = {}
  const interactions: SystemInteraction[] = []
  const contributions: Record<ResourceId, EffectPart[]> = {
    energy: [],
    oxygen: [],
    food: [],
    radiation: [],
    health: [],
  }

  let healthDelta = 0
  let foodDelta = 0
  let oxygenDelta = 0
  let radiationDelta = 0

  const radPenalty = getRadiationHealthPenalty(resources.radiation)
  if (radPenalty === 0) {
    interactions.push({
      text: isEn
        ? 'Radiation shielding 100%: No radiation-related health loss.'
        : 'Radyasyon koruması %100: Radyasyon kaynaklı sağlık kaybı yok.',
      severity: 'good',
    })
  } else {
    healthDelta += radPenalty
    contributions.health.push({ label: isEn ? 'Radiation' : 'Radyasyon', value: radPenalty })
    interactions.push({
      text: isEn
        ? `Radiation shielding (${resources.radiation}): Crew health ${radPenalty}/day.`
        : `Radyasyon koruması (${resources.radiation}): Mürettebat sağlığı ${radPenalty}/gün.`,
      severity: resources.radiation < 50 ? 'danger' : 'warn',
    })
  }

  if (resources.food >= 75) {
    healthDelta += 1
    contributions.health.push({ label: isEn ? 'Well-fed' : 'İyi beslenme', value: 1 })
    interactions.push({
      text: isEn
        ? 'Ample food (75+): Good nutrition +1 health/day.'
        : 'Yeterli gıda (75+): İyi beslenme +1 sağlık/gün.',
      severity: 'good',
    })
  } else if (resources.food < 25) {
    healthDelta -= 5
    contributions.health.push({ label: isEn ? 'Food shortage' : 'Gıda kıtlığı', value: -5 })
    interactions.push({
      text: isEn
        ? 'Critical food shortage (<25): Crew health -5/day!'
        : 'Kritik gıda kıtlığı (<25): Mürettebat sağlığı -5/gün!',
      severity: 'danger',
    })
  } else if (resources.food < 50) {
    healthDelta -= 2
    contributions.health.push({ label: isEn ? 'Low food' : 'Düşük gıda', value: -2 })
    interactions.push({
      text: isEn
        ? 'Low food (<50): Crew health -2/day.'
        : 'Düşük gıda (<50): Mürettebat sağlığı -2/gün.',
      severity: 'warn',
    })
  }

  if (resources.oxygen < 25) {
    healthDelta -= 6
    foodDelta -= 3
    contributions.health.push({ label: isEn ? 'Critical oxygen' : 'Kritik oksijen', value: -6 })
    contributions.food.push({ label: isEn ? 'Low water/O₂' : 'Düşük su/oksijen', value: -3 })
    interactions.push({
      text: isEn
        ? 'Critical oxygen/water (<25): Health -6/day & greenhouse -3 food/day!'
        : 'Kritik oksijen/su (<25): Sağlık -6/gün ve sera -3 gıda/gün!',
      severity: 'danger',
    })
  } else if (resources.oxygen < 50) {
    healthDelta -= 3
    foodDelta -= 1
    contributions.health.push({ label: isEn ? 'Low oxygen' : 'Düşük oksijen', value: -3 })
    contributions.food.push({ label: isEn ? 'Low water/O₂' : 'Düşük su/oksijen', value: -1 })
    interactions.push({
      text: isEn
        ? 'Low oxygen/water (<50): Health -3/day & greenhouse -1 food/day.'
        : 'Düşük oksijen/su (<50): Sağlık -3/gün ve sera -1 gıda/gün.',
      severity: 'warn',
    })
  } else if (resources.oxygen < 75) {
    healthDelta -= 1
    contributions.health.push({ label: isEn ? 'Moderate O₂' : 'Orta oksijen', value: -1 })
    interactions.push({
      text: isEn
        ? 'Moderate oxygen/water (<75): Crew health -1/day.'
        : 'Orta oksijen/su (<75): Mürettebat sağlığı -1/gün.',
      severity: 'warn',
    })
  }

  if (resources.energy < 25) {
    oxygenDelta -= 2
    radiationDelta -= 2
    contributions.oxygen.push({ label: isEn ? 'Low energy' : 'Düşük enerji', value: -2 })
    contributions.radiation.push({ label: isEn ? 'Low energy' : 'Düşük enerji', value: -2 })
    interactions.push({
      text: isEn
        ? 'Critical power (<25): Life Support (-2) & Shield (-2) output weakened!'
        : 'Kritik enerji (<25): Yaşam destek (-2) ve kalkan (-2) zayıflıyor!',
      severity: 'danger',
    })
  }

  if (healthDelta !== 0) effects.health = healthDelta
  if (foodDelta !== 0) effects.food = foodDelta
  if (oxygenDelta !== 0) effects.oxygen = oxygenDelta
  if (radiationDelta !== 0) effects.radiation = radiationDelta

  return { effects, interactions, contributions }
}

export function calculateSystemEffects(
  resources: Resources,
  lang: Language = 'en',
): {
  effects: Partial<Resources>
  interactions: SystemInteraction[]
} {
  const { effects, interactions } = evaluateSystemEffects(resources, lang)
  return { effects, interactions }
}

export function calculateDailyDelta(
  modules: ModuleLevels,
  day: number,
  resources?: Resources,
  crewCount = 3,
): Resources {
  const delta: Resources = getEffectiveBaseDrain(crewCount)
  const night = isLunarNight(day)

  for (const mod of RULES.modules) {
    const level = modules[mod.id]
    if (level <= 0) continue
    if (night && mod.affectedByLunarNight) continue
    if (!night && mod.onlyAtNight) continue

    for (const id of RESOURCE_IDS) {
      const change = mod.perDay[id]
      if (change !== undefined) {
        delta[id] += change * level
      }
    }
  }

  if (resources) {
    const { effects } = calculateSystemEffects(resources)
    for (const id of RESOURCE_IDS) {
      delta[id] += effects[id] ?? 0
    }
  }

  return delta
}

const formatSigned = (n: number) => (n > 0 ? `+${n}` : `${n}`)

export function calculateDailyBreakdown(
  modules: ModuleLevels,
  day: number,
  resources?: Resources,
  crewCount = 3,
  lang: Language = 'en',
): Record<ResourceId, string> {
  const isEn = lang === 'en'
  const night = isLunarNight(day)
  const baseDrain = getEffectiveBaseDrain(crewCount)
  const delta = calculateDailyDelta(modules, day, resources, crewCount)
  const systemParts = resources
    ? evaluateSystemEffects(resources, lang).contributions
    : null

  const result = {} as Record<ResourceId, string>

  for (const id of RESOURCE_IDS) {
    const baseVal = baseDrain[id]
    const crewUnit = isEn ? `${crewCount} crew` : `${crewCount} kişi`
    const label =
      id === 'oxygen' || id === 'food'
        ? `${BASE_DRAIN_LABELS[lang][id]} (${crewUnit})`
        : BASE_DRAIN_LABELS[lang][id]
    const parts: string[] = [`${label} ${formatSigned(baseVal)}`]

    for (const mod of RULES.modules) {
      const level = modules[mod.id]
      if (level <= 0) continue
      const perUnit = mod.perDay[id]
      if (perUnit === undefined) continue
      const modName = getModuleName(mod.id, lang)

      if (night && mod.affectedByLunarNight) {
        parts.push(`${modName} 0 (${isEn ? 'Lunar night' : 'Ay gecesi'})`)
        continue
      }
      if (!night && mod.onlyAtNight) continue

      parts.push(`${modName} ${formatSigned(perUnit * level)}`)
    }

    if (systemParts) {
      for (const item of systemParts[id]) {
        parts.push(`${item.label} ${formatSigned(item.value)}`)
      }
    }

    result[id] = `${parts.join(', ')} → net ${formatSigned(delta[id])}`
  }

  return result
}

export function analyzeLossReason(state: GameState, lang: Language = 'en'): string {
  const isEn = lang === 'en'
  const reason = state.lossReason
  if (!reason) {
    return isEn
      ? 'A critical resource was depleted. Upgrading modules and balancing energy early can save the mission.'
      : 'Kritik bir kaynak tükendi. Modül yükseltmelerini ve enerji dengesini erken kurmak görevi kurtarır.'
  }

  if (reason === 'energy') {
    const nightDrop = state.history.find(
      (entry) => entry.isNight && entry.dailyDelta && entry.dailyDelta.energy < 0,
    )
    if (nightDrop && state.modules.battery === 0) {
      return isEn
        ? `Energy ran out because Lunar Night began on Day ${nightDrop.day} and solar panels stopped. Building a Battery Bank would have prevented this.`
        : `Enerji bitti çünkü ${nightDrop.day}. günde Ay gecesi başladı ve güneş panelleri durdu. Batarya kurmak bunu önlerdi.`
    }
    if (isLunarNight(state.day) && state.modules.battery > 0) {
      return isEn
        ? `Energy ran out because base consumption exceeded battery support (+${state.modules.battery * 5}/day) during Lunar Night. Storing more power in daylight or upgrading the Battery Bank would have prevented this.`
        : `Enerji bitti çünkü Ay gecesi boyunca üs tüketimi batarya desteğini (+${state.modules.battery * 5}/gün) aştı. Gündüz daha çok enerji biriktirmek veya Bataryayı geliştirmek bunu önlerdi.`
    }
    const firstDrop = state.history.find((e) => e.dailyDelta && e.dailyDelta.energy < 0)
    if (firstDrop) {
      return isEn
        ? `Energy ran out because consumption exceeded generation starting on Day ${firstDrop.day}. Upgrading the Solar Array earlier would have prevented this.`
        : `Enerji bitti çünkü ${firstDrop.day}. günden itibaren tüketim üretimi aştı. Güneş panelini erken yükseltmek bunu önlerdi.`
    }
    return isEn
      ? 'Energy ran out. Balance your Solar Array early and prepare Battery Banks before Lunar Night.'
      : 'Enerji tükendi. Güneş paneli ve Ay gecesi için Batarya dengesini erken kurmak gerekir.'
  }

  if (reason === 'oxygen') {
    const lowEnergyDay = state.history.find(
      (entry) => entry.dailyDelta && entry.dailyDelta.energy < -4,
    )
    if (state.resources.energy < 25 || lowEnergyDay) {
      return isEn
        ? 'Oxygen/water ran out because low power weakened Life Support and consumption outpaced production. Keeping Life Support and Energy balanced would have prevented this.'
        : 'Oksijen/su bitti çünkü enerji yetersizliği yaşam desteğini zayıflattı ve tüketim üretimi aştı. Yaşam destek ve enerjiyi dengede tutmak bunu önlerdi.'
    }
    return isEn
      ? `Oxygen/water ran out because a crew of ${state.crewCount} consumed more than Life Support produced. Upgrading Life Support would have prevented this.`
      : `Oksijen/su tükendi çünkü ${state.crewCount} astronotluk mürettebat tüketimi yaşam destek üretimini aştı. Yaşam destek modülünü yükseltmek bunu önlerdi.`
  }

  if (reason === 'food') {
    const oxyPenaltyDay = state.history.find((e) => e.dailyDelta && e.dailyDelta.oxygen < 0)
    if (state.resources.oxygen < 50 && oxyPenaltyDay) {
      return isEn
        ? `Food ran out because falling oxygen/water since Day ${oxyPenaltyDay.day} reduced Greenhouse yield. Keeping oxygen/water above 50 and upgrading the Greenhouse would have prevented this.`
        : `Gıda bitti çünkü ${oxyPenaltyDay.day}. günden itibaren düşen oksijen/su sera verimini düşürdü. Oksijen/suyu 50 üstünde tutup Serayı yükseltmek bunu önlerdi.`
    }
    return isEn
      ? `Food ran out because Greenhouse output could not feed ${state.crewCount} astronauts daily. Upgrading the Greenhouse to Lv. 2 early would have prevented this.`
      : `Gıda tükendi çünkü sera üretimi ${state.crewCount} kişilik günlük tüketimi karşılayamadı. Serayı erken Sv.2 yapmak bunu önlerdi.`
  }

  if (reason === 'radiation') {
    return isEn
      ? 'Radiation shielding collapsed because the Shield module could not keep up with daily solar radiation and events. Upgrading the Shield and keeping Energy above 25 would have prevented this.'
      : 'Radyasyon koruması sıfırlandı çünkü Kalkan modülü günlük güneş radyasyonuna ve olaylara yetmedi. Kalkanı yükseltmek ve enerjiyi 25 üstünde tutmak bunu önlerdi.'
  }

  const causes: string[] = []
  if (state.modules.exercise === 0)
    causes.push(
      isEn ? 'Exercise Equipment was never built' : 'Egzersiz ekipmanı hiç kurulmamıştı',
    )
  if (state.resources.radiation < 75)
    causes.push(
      isEn ? 'low radiation shielding caused extra damage' : 'düşük radyasyon koruması ek hasar verdi',
    )
  if (state.resources.oxygen < 50)
    causes.push(
      isEn ? 'low oxygen/water drained health quickly' : 'düşük oksijen/su sağlığı hızla düşürdü',
    )
  if (state.resources.food < 50)
    causes.push(
      isEn ? 'low food supplies weakened the crew' : 'yetersiz gıda mürettebatı zayıflattı',
    )

  if (causes.length > 0) {
    return isEn
      ? `Crew health ran out because ${causes.join(' and ')}. Building Exercise Equipment and keeping vital systems above 50 would have prevented this.`
      : `Mürettebat sağlığı bitti çünkü ${causes.join(' ve ')}. Egzersiz ekipmanı kurup diğer kaynakları 50 üstünde tutmak bunu önlerdi.`
  }
  return isEn
    ? 'Crew health was exhausted. Upgrading Exercise Equipment and maintaining high radiation shielding would have prevented this.'
    : 'Mürettebat sağlığı tükendi. Egzersiz ekipmanını geliştirmek ve radyasyon korumasını yüksek tutmak bunu önlerdi.'
}

function applyResourceDelta(
  current: Resources,
  delta: Partial<Resources>,
): { next: Resources; lossReason: ResourceId | null } {
  const next: Resources = { ...current }
  let lossReason: ResourceId | null = null

  for (const id of RESOURCE_IDS) {
    const raw = current[id] + (delta[id] ?? 0)
    const clamped = Math.max(0, Math.min(100, raw))
    next[id] = clamped
    if (clamped === 0 && lossReason === null) {
      lossReason = id
    }
  }

  return { next, lossReason }
}

function updateDayLog(
  history: DayLog[],
  day: number,
  updater: (entry: DayLog) => DayLog,
): DayLog[] {
  let found = false
  const next = history.map((entry) => {
    if (entry.day !== day) return entry
    found = true
    return updater(entry)
  })
  if (!found) {
    next.push(updater({ day, isNight: isLunarNight(day), upgrades: [] }))
  }
  return next
}

export function startBuild(
  state: GameState,
  moduleId: ModuleId,
  assignCrew: number,
): GameState {
  if (state.status !== 'playing' || state.activeEvent !== null) {
    return state
  }
  if (state.activeBuilds[moduleId]) {
    return state
  }
  const def = RULES.modules.find((m) => m.id === moduleId)
  if (!def) return state
  const currentLevel = state.modules[moduleId]
  if (currentLevel >= def.maxLevel || state.budget < def.cost) {
    return state
  }
  const idleCrew = getIdleCrewCount(state)
  const crewToAssign = Math.max(0, Math.min(assignCrew, idleCrew))
  if (crewToAssign <= 0) {
    return state
  }

  const totalWork = getModuleWorkCost(def)
  const nextBuild: ActiveBuild = {
    moduleId,
    targetLevel: currentLevel + 1,
    remainingWork: totalWork,
    totalWork,
    assignedCrew: crewToAssign,
  }

  return {
    ...state,
    budget: state.budget - def.cost,
    activeBuilds: {
      ...state.activeBuilds,
      [moduleId]: nextBuild,
    },
  }
}

export function adjustBuildCrew(
  state: GameState,
  moduleId: ModuleId,
  deltaCrew: number,
): GameState {
  if (state.status !== 'playing' || state.activeEvent !== null) {
    return state
  }
  const existing = state.activeBuilds[moduleId]
  if (!existing || deltaCrew === 0) return state

  const idleCrew = getIdleCrewCount(state)
  let nextAssigned = existing.assignedCrew
  if (deltaCrew > 0) {
    nextAssigned += Math.min(deltaCrew, idleCrew)
  } else {
    nextAssigned = Math.max(0, existing.assignedCrew + deltaCrew)
  }

  if (nextAssigned === existing.assignedCrew) return state

  return {
    ...state,
    activeBuilds: {
      ...state.activeBuilds,
      [moduleId]: {
        ...existing,
        assignedCrew: nextAssigned,
      },
    },
  }
}

export function upgradeModule(state: GameState, moduleId: ModuleId): GameState {
  return startBuild(state, moduleId, 1)
}

export function nextDay(
  state: GameState,
  eventChance = DIFFICULTY_CONFIG[state.difficulty].eventChance,
): GameState {
  if (state.status !== 'playing' || state.activeEvent !== null) {
    return state
  }

  const delta = calculateDailyDelta(
    state.modules,
    state.day,
    state.resources,
    state.crewCount,
  )
  const { next: nextResources, lossReason } = applyResourceDelta(state.resources, delta)

  // Aktif inşaatları atanan astronot sayısı kadar ilerlet ve bitenleri yükselt
  const nextModules: ModuleLevels = { ...state.modules }
  const nextActiveBuilds: Partial<Record<ModuleId, ActiveBuild>> = {}
  const completedNotes: string[] = []
  const completedItems: UpgradeLogItem[] = []

  for (const build of Object.values(state.activeBuilds)) {
    if (!build) continue
    const remaining = build.remainingWork - build.assignedCrew
    if (remaining <= 0) {
      const def = RULES.modules.find((m) => m.id === build.moduleId)
      const prevLevel = nextModules[build.moduleId]
      nextModules[build.moduleId] = build.targetLevel
      completedNotes.push(`${def?.name ?? build.moduleId} (Sv. ${prevLevel} → Sv. ${build.targetLevel})`)
      completedItems.push({
        moduleId: build.moduleId,
        prevLevel,
        targetLevel: build.targetLevel,
      })
    } else {
      nextActiveBuilds[build.moduleId] = {
        ...build,
        remainingWork: remaining,
      }
    }
  }

  const historyWithDelta = updateDayLog(state.history, state.day, (entry) => ({
    ...entry,
    dailyDelta: delta,
    upgrades: [...entry.upgrades, ...completedNotes],
    upgradeItems: [...(entry.upgradeItems ?? []), ...completedItems],
  }))

  if (lossReason !== null) {
    return {
      ...state,
      modules: nextModules,
      activeBuilds: nextActiveBuilds,
      resources: nextResources,
      status: 'lost',
      lastDelta: delta,
      lossReason,
      history: historyWithDelta,
    }
  }
  if (state.day >= RULES.maxDays) {
    return {
      ...state,
      modules: nextModules,
      activeBuilds: nextActiveBuilds,
      resources: nextResources,
      status: 'won',
      lastDelta: delta,
      history: historyWithDelta,
    }
  }

  const nextDayNumber = state.day + 1
  const scheduledStory = EARTH_MESSAGES.find((msg) => msg.day === nextDayNumber) ?? null
  const shouldTriggerEvent =
    !scheduledStory && nextDayNumber >= 4 && EVENTS.length > 0 && Math.random() < eventChance
  const pickedEvent =
    scheduledStory ??
    (shouldTriggerEvent ? EVENTS[Math.floor(Math.random() * EVENTS.length)] : null)

  return {
    ...state,
    day: nextDayNumber,
    modules: nextModules,
    activeBuilds: nextActiveBuilds,
    resources: nextResources,
    budget: state.budget + RULES.dailyBudgetGain,
    activeEvent: pickedEvent,
    lastDelta: delta,
    history: [
      ...historyWithDelta,
      { day: nextDayNumber, isNight: isLunarNight(nextDayNumber), upgrades: [] },
    ],
  }
}

export function isOptionUnlocked(option: EventOption, modules: ModuleLevels): boolean {
  if (!option.requires) return true
  return modules[option.requires.moduleId] >= option.requires.minLevel
}

export function resolveEvent(state: GameState, optionIndex: number): GameState {
  if (state.status !== 'playing' || state.activeEvent === null) {
    return state
  }
  const option = state.activeEvent.options[optionIndex]
  if (!option || !isOptionUnlocked(option, state.modules)) return state

  const { next: nextResources, lossReason } = applyResourceDelta(state.resources, option.effects)
  const activeEvent = state.activeEvent

  return {
    ...state,
    resources: nextResources,
    budget: Math.max(0, state.budget + (option.budgetDelta ?? 0)),
    activeEvent: null,
    lastDelta: option.effects,
    status: lossReason !== null ? 'lost' : state.status,
    lossReason,
    history: updateDayLog(state.history, state.day, (entry) => ({
      ...entry,
      event: {
        eventId: activeEvent.id,
        optionIndex,
        title: activeEvent.title,
        chosenLabel: option.label,
        explanation: option.explanation,
        effects: option.effects,
      },
    })),
  }
}
