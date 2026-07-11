import type { Ranking } from '../../../entities/character'

export interface DtoCharacterList {
  id: string
  name: string
  description: string
  userId?: string | null | undefined
  ranking: Ranking
  maxRanking: Ranking
  level: number
  xp: number
  breakthroughAttempts: number
  hp: number
  atk: number
  def: number
  spd: number
  powerId: string
  traits: { id: string; name: string }[]
  createdAt: Date
}
