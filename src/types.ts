export type ResourceId = 'energy' | 'oxygen' | 'food' | 'radiation' | 'health'
export type ModuleId = 'solar' | 'lifeSupport' | 'greenhouse' | 'shield' | 'exercise'

export type Resources = Record<ResourceId, number>
export type ModuleLevels = Record<ModuleId, number>

export interface EventRequirement {
  moduleId: ModuleId
  minLevel: number
}

export interface EventOption {
  label: string
  effects: Partial<Resources>
  explanation: string
  requires?: EventRequirement
}

export interface GameEvent {
  id: string
  title: string
  description: string
  options: EventOption[]
}

export interface ModuleDef {
  id: ModuleId
  name: string
  description: string
  cost: number
  maxLevel: number
  perDay: Partial<Resources>
  affectedByLunarNight?: boolean
}

export interface RulesConfig {
  maxDays: number
  startingBudget: number
  dailyBudgetGain: number
  lunarNightStartDay: number
  lunarNightEndDay: number
  initialResources: Resources
  initialModules: ModuleLevels
  baseDailyDrain: Resources
  modules: ModuleDef[]
}

export interface TutorialStep {
  day: number
  title: string
  message: string
}

export interface GameState {
  day: number
  resources: Resources
  modules: ModuleLevels
  budget: number
  status: 'playing' | 'won' | 'lost'
  activeEvent: GameEvent | null
  lastDelta: Partial<Resources> | null
  lossReason: ResourceId | null
}