import type { BonusType, StatType } from '../../../entities/battle-field'

export interface DtoBattleFieldModifierRaw {
  id: string
  traitId: string
  traitName: string
  stat: StatType
  bonusType: BonusType
  bonusValue: number
}

export interface DtoBattleFieldRaw {
  id: string
  name: string
  description: string
  modifiers: DtoBattleFieldModifierRaw[]
  createdAt: Date
}
