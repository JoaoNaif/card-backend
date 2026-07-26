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
  hp: number
  atk: number
  def: number
  spd: number
  power: DtoPowerRaw
  secondaryPower?: DtoPowerRaw | null
  traits: { id: string; name: string }[]
  createdAt: Date
}
