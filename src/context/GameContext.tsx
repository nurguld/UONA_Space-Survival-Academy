import { createContext, useContext, useReducer } from 'react'
import type { ReactNode } from 'react'
import type { GameState, ModuleId, RulesConfig, TutorialStep } from '../types'
import {
  RULES,
  TUTORIAL,
  createInitialState,
  nextDay as stepNextDay,
  resolveEvent as stepResolveEvent,
  upgradeModule as stepUpgradeModule,
} from '../game/engine'

type Action =
  | { type: 'START_GAME' }
  | { type: 'UPGRADE_MODULE'; moduleId: ModuleId }
  | { type: 'NEXT_DAY' }
  | { type: 'RESOLVE_EVENT'; optionIndex: number }

function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'START_GAME':
      return createInitialState()
    case 'UPGRADE_MODULE':
      return stepUpgradeModule(state, action.moduleId)
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
  startGame: () => void
  upgradeModule: (moduleId: ModuleId) => void
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
    startGame: () => dispatch({ type: 'START_GAME' }),
    upgradeModule: (moduleId) => dispatch({ type: 'UPGRADE_MODULE', moduleId }),
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