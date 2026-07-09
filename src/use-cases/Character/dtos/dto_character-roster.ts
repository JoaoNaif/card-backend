import type { Ranking } from '../../../entities/character'
import type { DtoPowerRaw } from '../../Power/dtos/dto-power-raw'

export interface DtoCharacterRoster {
  id: string
  name: string
  description: string
  userId?: string | null | undefined
  ranking: Ranking
  level: number
  xp: number
  baseHp: number
  baseAtk: number
  baseDef: number
  baseSpd: number
  power: DtoPowerRaw
  traits: { id: string; name: string }[]
  createdAt: Date
}
