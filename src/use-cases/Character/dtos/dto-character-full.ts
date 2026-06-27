import type { Ranking } from '../../../entities/character'
import type { DtoPowerRaw } from '../../Power/dtos/dto-power-raw'
import type { DtoSkillRaw } from '../../Skill/dtos/dto-skill-raw'

export interface DtoCharacterFull {
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
  power: DtoPowerRaw
  secondaryPower?: DtoPowerRaw | null | undefined
  awakenedPower?: DtoPowerRaw | null | undefined
  traits: { id: string; name: string }[]
  skills: DtoSkillRaw[]
  createdAt: Date
}
