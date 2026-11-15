export type ResourceId = 'energy' | 'oxygen' | 'food' | 'radiation' | 'health'
export type ModuleId = 'solar' | 'lifeSupport' | 'greenhouse' | 'shield' | 'exercise' | 'battery'
export type DifficultyLevel = 'easy' | 'normal' | 'hard'

export type Resources = Record<ResourceId, number>
export type ModuleLevels = Record<ModuleId, number>

export interface MissionSetup {
  crewCount: number
  difficulty: DifficultyLevel
}

export interface ActiveBuild {
  moduleId: ModuleId
  targetLevel: number
  remainingWork: number
  totalWork: number
  assignedCrew: number
}

export interface EventRequirement {
  moduleId: ModuleId
  minLevel: number
}

export interface EventOption {
  label: string
  effects: Partial<Resources>
  explanation: string
  requires?: EventRequirement
  badge?: string
  focusModuleId?: ModuleId
  budgetDelta?: number
}

export interface GameEvent {
  id: string
  title: string
  description: string
  options: EventOption[]
  kind?: 'alert' | 'earth'
  dayLabel?: string
}

export interface ModuleDef {
  id: ModuleId
  name: string
  description: string
  cost: number
  maxLevel: number
  workDays?: number
  perDay: Partial<Resources>
  affectedByLunarNight?: boolean
  onlyAtNight?: boolean // sadece Ay gecesi etki eder (ör. batarya)
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

export interface EventLogRecord {
  title: string
  chosenLabel: string
  explanation: string
  effects: Partial<Resources>
}

export interface DayLog {
  day: number
  isNight: boolean
  upgrades: string[]
  dailyDelta?: Resources
  event?: EventLogRecord
}

export interface GameState {
  day: number
  crewCount: number
  difficulty: DifficultyLevel
  resources: Resources
  modules: ModuleLevels
  activeBuilds: Partial<Record<ModuleId, ActiveBuild>>
  budget: number
  status: 'playing' | 'won' | 'lost'
  activeEvent: GameEvent | null
  lastDelta: Partial<Resources> | null
  lossReason: ResourceId | null
  history: DayLog[]
}

export interface SceneNavigationHandle {
  walkToModule: (moduleId: ModuleId) => void
}
