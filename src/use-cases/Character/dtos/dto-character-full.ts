import type { Ranking } from '../../../entities/character'
import type { DtoPowerRaw } from '../../Power/dtos/dto-power-raw'
import type { DtoSkillAndPower } from '../../Skill/dtos/dto-skill-and-power'

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
  hp: number
  atk: number
  def: number
  spd: number
  pendingSkillSelections: number
  power: DtoPowerRaw
  secondaryPower?: DtoPowerRaw | null | undefined
  awakenedPower?: DtoPowerRaw | null | undefined
  traits: { id: string; name: string }[]
  skills: DtoSkillAndPower[]
  createdAt: Date
}
