import type { Ranking } from '../../../entities/character'

export interface DtoCharacterRaw {
  id: string
  name: string
  description: string
  userId?: string | null | undefined
  ranking: Ranking
  maxRanking: Ranking
  level: number
  xp: number
  breakthroughAttempts: number
  baseHp: number
  baseAtk: number
  baseDef: number
  baseSpd: number
  secondaryPowerId?: string | null | undefined
  awakenedPowerId?: string | null | undefined
  powerId: string
  traits: { id: string; name: string }[]
  createdAt: Date
}
