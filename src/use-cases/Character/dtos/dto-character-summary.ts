import type { Ranking } from '../../../entities/character'
import type { DtoPowerRaw } from '../../Power/dtos/dto-power-raw'

export interface DtoCharacterSummary {
  id: string
  name: string
  level: number
  ranking: Ranking
  maxRanking: Ranking
  hp: number
  atk: number
  def: number
  spd: number
  power: DtoPowerRaw
}