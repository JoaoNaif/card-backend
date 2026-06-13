import { Entity } from '../core/entities/entity'
import type { UniqueEntityId } from '../core/entities/unique-entity-id'
import type { Optional } from '../core/type/optional'

export type StatType = 'HP' | 'ATK' | 'DEF' | 'SPD'
export type BonusType = 'PERCENT' | 'FLAT'

export interface BattleFieldModifier {
  id: string
  traitId: string
  traitName: string
  stat: StatType
  bonusType: BonusType
  bonusValue: number
}

export interface BattleFieldProps {
  name: string
  description: string
  modifiers: BattleFieldModifier[]
  createdAt: Date
}

export class BattleField extends Entity<BattleFieldProps> {
  get name() {
    return this.props.name
  }

  get description() {
    return this.props.description
  }

  get modifiers() {
    return this.props.modifiers
  }

  get createdAt() {
    return this.props.createdAt
  }

  modifiersFor(traitIds: string[]): BattleFieldModifier[] {
    return this.props.modifiers.filter((m) => traitIds.includes(m.traitId))
  }

  static create(
    props: Optional<BattleFieldProps, 'createdAt' | 'modifiers'>,
    id?: UniqueEntityId
  ) {
    return new BattleField(
      {
        ...props,
        modifiers: props.modifiers ?? [],
        createdAt: props.createdAt ?? new Date(),
      },
      id
    )
  }
}
