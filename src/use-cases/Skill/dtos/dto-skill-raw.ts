import type { StatType } from '../../../entities/skill'

export interface DtoSkillRaw {
  id: string
  name: string
  description: string
  limitation: string
  cooldownTurns: number
  debuffDuration: number
  debuffStat: StatType
  debuffValue: number
  minLevel: number
  powerId: string
  appliesBattleFieldId?: string | null
  fieldDuration?: number | null
  createdAt: Date
}
