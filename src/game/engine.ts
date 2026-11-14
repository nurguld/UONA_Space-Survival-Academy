import type {
  EventOption,
  GameEvent,
  GameState,
  ModuleId,
  ModuleLevels,
  ResourceId,
  Resources,
  RulesConfig,
  TutorialStep,
} from '../types'
import rulesData from '../data/rules.json'
import eventsData from '../data/events.json'
import tutorialData from '../data/tutorial.json'

export const RULES = rulesData as RulesConfig
export const EVENTS = eventsData as GameEvent[]
export const TUTORIAL = tutorialData as TutorialStep[]

const RESOURCE_IDS: ResourceId[] = ['energy', 'oxygen', 'food', 'radiation', 'health']

export function isLunarNight(day: number): boolean {
  return day >= RULES.lunarNightStartDay && day <= RULES.lunarNightEndDay
}

export function createInitialState(): GameState {
  return {
    day: 1,
    resources: { ...RULES.initialResources },
    modules: { ...RULES.initialModules },
    budget: RULES.startingBudget,
    status: 'playing',
    activeEvent: null,
    lastDelta: null,
    lossReason: null,
  }
}

export interface SystemInteraction {
  text: string
  severity: 'good' | 'warn' | 'danger'
}

function getRadiationHealthPenalty(radiation: number): number {
  if (radiation >= 100) return 0
  if (radiation >= 75) return -1
  if (radiation >= 50) return -3
  if (radiation >= 25) return -5
  return -8
}

export function calculateSystemEffects(resources: Resources): {
  effects: Partial<Resources>
  interactions: SystemInteraction[]
} {
  const effects: Partial<Resources> = {}
  const interactions: SystemInteraction[] = []
  let healthDelta = 0
  let foodDelta = 0
  let oxygenDelta = 0
  let radiationDelta = 0

  const radPenalty = getRadiationHealthPenalty(resources.radiation)
  if (radPenalty === 0) {
    interactions.push({
      text: 'Radyasyon koruması %100: Radyasyon kaynaklı sağlık kaybı yok.',
      severity: 'good',
    })
  } else {
    healthDelta += radPenalty
    interactions.push({
      text: `Radyasyon koruması (${resources.radiation}): Mürettebat sağlığı ${radPenalty}/gün.`,
      severity: resources.radiation < 50 ? 'danger' : 'warn',
    })
  }

  if (resources.food >= 75) {
    healthDelta += 1
    interactions.push({
      text: 'Yeterli gıda (75+): İyi beslenme +1 sağlık/gün.',
      severity: 'good',
    })
  } else if (resources.food < 25) {
    healthDelta -= 5
    interactions.push({
      text: 'Kritik gıda kıtlığı (<25): Mürettebat sağlığı -5/gün!',
      severity: 'danger',
    })
  } else if (resources.food < 50) {
    healthDelta -= 2
    interactions.push({
      text: 'Düşük gıda (<50): Mürettebat sağlığı -2/gün.',
      severity: 'warn',
    })
  }

  if (resources.oxygen < 25) {
    healthDelta -= 6
    foodDelta -= 3
    interactions.push({
      text: 'Kritik oksijen/su (<25): Sağlık -6/gün ve sera -3 gıda/gün!',
      severity: 'danger',
    })
  } else if (resources.oxygen < 50) {
    healthDelta -= 3
    foodDelta -= 1
    interactions.push({
      text: 'Düşük oksijen/su (<50): Sağlık -3/gün ve sera -1 gıda/gün.',
      severity: 'warn',
    })
  } else if (resources.oxygen < 75) {
    healthDelta -= 1
    interactions.push({
      text: 'Orta oksijen/su (<75): Mürettebat sağlığı -1/gün.',
      severity: 'warn',
    })
  }

  if (resources.energy < 25) {
    oxygenDelta -= 2
    radiationDelta -= 2
    interactions.push({
      text: 'Kritik enerji (<25): Yaşam destek (-2) ve kalkan (-2) zayıflıyor!',
      severity: 'danger',
    })
  }

  if (healthDelta !== 0) effects.health = healthDelta
  if (foodDelta !== 0) effects.food = foodDelta
  if (oxygenDelta !== 0) effects.oxygen = oxygenDelta
  if (radiationDelta !== 0) effects.radiation = radiationDelta

  return { effects, interactions }
}

export function calculateDailyDelta(
  modules: ModuleLevels,
  day: number,
  resources?: Resources,
): Resources {
  const delta: Resources = { ...RULES.baseDailyDrain }
  const night = isLunarNight(day)

  for (const mod of RULES.modules) {
    const level = modules[mod.id]
    if (level <= 0) continue
    if (night && mod.affectedByLunarNight) continue

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

export function upgradeModule(state: GameState, moduleId: ModuleId): GameState {
  if (state.status !== 'playing' || state.activeEvent !== null) {
    return state
  }

  const def = RULES.modules.find((m) => m.id === moduleId)
  if (!def) return state

  const currentLevel = state.modules[moduleId]
  if (currentLevel >= def.maxLevel || state.budget < def.cost) {
    return state
  }

  return {
    ...state,
    budget: state.budget - def.cost,
    modules: {
      ...state.modules,
      [moduleId]: currentLevel + 1,
    },
  }
}

export function nextDay(state: GameState, eventChance = 0.45): GameState {
  if (state.status !== 'playing' || state.activeEvent !== null) {
    return state
  }

  const delta = calculateDailyDelta(state.modules, state.day, state.resources)
  const { next: nextResources, lossReason } = applyResourceDelta(state.resources, delta)

  if (lossReason !== null) {
    return {
      ...state,
      resources: nextResources,
      status: 'lost',
      lastDelta: delta,
      lossReason,
    }
  }

  if (state.day >= RULES.maxDays) {
    return {
      ...state,
      resources: nextResources,
      status: 'won',
      lastDelta: delta,
    }
  }

  const nextDayNumber = state.day + 1
  const shouldTriggerEvent = nextDayNumber >= 4 && EVENTS.length > 0 && Math.random() < eventChance
  const pickedEvent = shouldTriggerEvent
    ? EVENTS[Math.floor(Math.random() * EVENTS.length)]
    : null

  return {
    ...state,
    day: nextDayNumber,
    resources: nextResources,
    budget: state.budget + RULES.dailyBudgetGain,
    activeEvent: pickedEvent,
    lastDelta: delta,
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
  return {
    ...state,
    resources: nextResources,
    activeEvent: null,
    lastDelta: option.effects,
    status: lossReason !== null ? 'lost' : state.status,
    lossReason,
  }
}