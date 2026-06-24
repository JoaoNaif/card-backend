import type { BattleMode } from '../../../entities/battle'

export interface DtoBattleRaw {
  id: string
  mode: BattleMode
  battleFieldId: string
  winnerTerm?: number | null | undefined
  totalTurns?: number | null | undefined
  maxTurns?: number | null | undefined
  log: string[]
  sessionState?: string[] | null | undefined
  createdAt: Date
  updatedAt: Date
}
