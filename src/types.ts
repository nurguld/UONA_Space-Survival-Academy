export type ResourceId = 'energy' | 'oxygen' | 'food' | 'radiation' | 'health'
export type ModuleId = 'solar' | 'lifeSupport' | 'greenhouse' | 'shield' | 'exercise'

export type Resources = Record<ResourceId, number>
export type ModuleLevels = Record<ModuleId, number>

export interface GameState {
  day: number
  resources: Resources
  modules: ModuleLevels
  budget: number
  status: 'playing' | 'won' | 'lost'
}

export interface EventOption {
  label: string
  effects: Partial<Resources>
  explanation: string
}

export interface GameEvent {
  id: string
  title: string
  description: string
  options: EventOption[]
}