import type { StatType, TargetType } from '../../../entities/skill'

export interface DtoSkillRaw {
  id: string
  name: string
  description: string
  limitation: string
  cooldownTurns: number
  debuffStat: StatType
  debuffValue: number
  debuffDuration: number
  targetType: TargetType
  damageMultiplier: number
  healMultiplier: number
  targetEffectStat?: StatType | null
  targetEffectValue?: number | null
  targetEffectDuration?: number | null
  minLevel: number
  powerId: string
  appliesBattleFieldId?: string | null
  fieldDuration?: number | null
  createdAt: Date
}
