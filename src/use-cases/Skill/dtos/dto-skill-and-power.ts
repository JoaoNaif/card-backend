import type { DtoBattleFieldRaw } from '../../BattleField/dtos/dto-battle-field-raw'
import type { DtoPowerRaw } from '../../Power/dtos/dto-power-raw'

export interface DtoSkillAndPower {
  id: string
  name: string
  description: string
  limitation: string
  cost: number
  minLevel: number
  powerId: string
  createdAt: Date
  power: DtoPowerRaw
  battleField: DtoBattleFieldRaw | null
  fieldDuration: number | null
}
