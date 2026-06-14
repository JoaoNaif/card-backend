import type { StatType } from '../../../entities/skill'
import type { DtoBattleFieldRaw } from '../../Battle-Field/dtos/dto-battle-field-raw'
import type { DtoPowerRaw } from '../../Power/dtos/dto-power-raw'

export interface DtoSkillAndPower {
  id: string
  name: string
  description: string
  limitation: string
  cooldownTurns: number
  debuffStat: StatType
  debuffValue: number
  debuffDuration: number
  minLevel: number
  powerId: string
  appliesBattleFieldId?: string | null
  fieldDuration?: number | null
  createdAt: Date
  power: DtoPowerRaw
  battleField: DtoBattleFieldRaw | null
}
