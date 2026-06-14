import { Entity } from '../core/entities/entity'
import type { UniqueEntityId } from '../core/entities/unique-entity-id'
import type { Optional } from '../core/type/optional'

export enum StatType {
  HP = 'HP',
  ATK = 'ATK',
  DEF = 'DEF',
  SPD = 'SPD',
}
export interface SkillProps {
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
}

export class Skill extends Entity<SkillProps> {
  get name() {
    return this.props.name
  }

  get description() {
    return this.props.description
  }

  get limitation() {
    return this.props.limitation
  }

  get minLevel() {
    return this.props.minLevel
  }

  get powerId() {
    return this.props.powerId
  }

  get appliesBattleFieldId() {
    return this.props.appliesBattleFieldId
  }

  get fieldDuration() {
    return this.props.fieldDuration
  }

  get cooldownTurns() {
    return this.props.cooldownTurns
  }

  get debuffStat() {
    return this.props.debuffStat
  }

  get debuffValue() {
    return this.props.debuffValue
  }

  get debuffDuration() {
    return this.props.debuffDuration
  }

  get createdAt() {
    return this.props.createdAt
  }

  static create(props: Optional<SkillProps, 'createdAt'>, id?: UniqueEntityId) {
    const skill = new Skill(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
      },
      id
    )
    return skill
  }
}
