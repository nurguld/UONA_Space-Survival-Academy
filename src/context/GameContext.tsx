import { createContext, useContext, useReducer } from 'react'
import type { ReactNode } from 'react'
import type {
  GameState,
  MissionSetup,
  ModuleId,
  RulesConfig,
  TutorialStep,
} from '../types'
import {
  RULES,
  TUTORIAL,
  adjustBuildCrew as stepAdjustBuildCrew,
  createInitialState,
  nextDay as stepNextDay,
  resolveEvent as stepResolveEvent,
  startBuild as stepStartBuild,
  upgradeModule as stepUpgradeModule,
} from '../game/engine'

type Action =
  | { type: 'START_GAME'; setup?: Partial<MissionSetup> }
  | { type: 'UPGRADE_MODULE'; moduleId: ModuleId }
  | { type: 'START_BUILD'; moduleId: ModuleId; assignCrew: number }
  | { type: 'ADJUST_BUILD_CREW'; moduleId: ModuleId; deltaCrew: number }
  | { type: 'NEXT_DAY' }
  | { type: 'RESOLVE_EVENT'; optionIndex: number }

function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'START_GAME':
      return createInitialState(action.setup)
    case 'UPGRADE_MODULE':
      return stepUpgradeModule(state, action.moduleId)
    case 'START_BUILD':
      return stepStartBuild(state, action.moduleId, action.assignCrew)
    case 'ADJUST_BUILD_CREW':
      return stepAdjustBuildCrew(state, action.moduleId, action.deltaCrew)
    case 'NEXT_DAY':
      return stepNextDay(state)
    case 'RESOLVE_EVENT':
      return stepResolveEvent(state, action.optionIndex)
  }
}

interface GameContextValue {
  state: GameState
  rules: RulesConfig
  tutorial: TutorialStep[]
  startGame: (setup?: Partial<MissionSetup>) => void
  upgradeModule: (moduleId: ModuleId) => void
  startBuild: (moduleId: ModuleId, assignCrew: number) => void
  adjustBuildCrew: (moduleId: ModuleId, deltaCrew: number) => void
  nextDay: () => void
  resolveEvent: (optionIndex: number) => void
}

const GameContext = createContext<GameContextValue | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialState)

  const value: GameContextValue = {
    state,
    rules: RULES,
    tutorial: TUTORIAL,
    startGame: (setup) => dispatch({ type: 'START_GAME', setup }),
    upgradeModule: (moduleId) => dispatch({ type: 'UPGRADE_MODULE', moduleId }),
    startBuild: (moduleId, assignCrew) =>
      dispatch({ type: 'START_BUILD', moduleId, assignCrew }),
    adjustBuildCrew: (moduleId, deltaCrew) =>
      dispatch({ type: 'ADJUST_BUILD_CREW', moduleId, deltaCrew }),
    nextDay: () => dispatch({ type: 'NEXT_DAY' }),
    resolveEvent: (optionIndex) => dispatch({ type: 'RESOLVE_EVENT', optionIndex }),
  }

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext)
  if (!ctx) {
    throw new Error('useGame, GameProvider icinde kullanilmalidir.')
  }
  return ctx
}
