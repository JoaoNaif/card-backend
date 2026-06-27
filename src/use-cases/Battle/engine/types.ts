import type { StatType } from '../../../entities/skill'

export interface ActiveEffect {
  stat: StatType
  value: number         // negative = debuff, positive = buff
  turnsRemaining: number
}

export interface CombatantState {
  characterId: string
  teamNumber: 1 | 2
  currentHp: number
  maxHp: number
  baseAtk: number
  baseDef: number
  baseSpd: number
  hasDualPower: boolean
  skillIds: string[]
  skillCooldowns: Record<string, number>
  activeEffects: ActiveEffect[]
  isAlive: boolean
  positionRow: number
  positionCol: number
}

export interface ActionLog {
  actorId: string
  skillId: string | null    // null = no eligible skill, turn skipped
  targetIds: string[]
  damage?: number
  heal?: number
  selfDebuff?: { stat: StatType; value: number; duration: number }
  effectApplied?: { stat: StatType; value: number; duration: number }
}

export interface TurnLog {
  turn: number
  actions: ActionLog[]
}

export interface BattleResult {
  winnerTeam: 1 | 2 | null   // null = draw
  totalTurns: number
  log: TurnLog[]
}
