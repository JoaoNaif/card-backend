import { Entity } from '../core/entities/entity'
import type { UniqueEntityId } from '../core/entities/unique-entity-id'
import type { Optional } from '../core/type/optional'

export enum StatType {
  HP = 'HP',
  ATK = 'ATK',
  DEF = 'DEF',
  SPD = 'SPD',
}

export enum TargetType {
  SINGLE_ENEMY = 'SINGLE_ENEMY',
  AOE_ENEMIES = 'AOE_ENEMIES',
  SINGLE_ALLY = 'SINGLE_ALLY',
  ALL_ALLIES = 'ALL_ALLIES',
  SELF = 'SELF',
}

export interface SkillProps {
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

  get targetType() {
    return this.props.targetType
  }

  get damageMultiplier() {
    return this.props.damageMultiplier
  }

  get healMultiplier() {
    return this.props.healMultiplier
  }

  get targetEffectStat() {
    return this.props.targetEffectStat
  }

  get targetEffectValue() {
    return this.props.targetEffectValue
  }

  get targetEffectDuration() {
    return this.props.targetEffectDuration
  }

  get createdAt() {
    return this.props.createdAt
  }

  static create(
    props: Optional<SkillProps, 'createdAt' | 'targetType' | 'damageMultiplier' | 'healMultiplier'>,
    id?: UniqueEntityId
  ) {
    const skill = new Skill(
      {
        ...props,
        targetType: props.targetType ?? TargetType.SINGLE_ENEMY,
        damageMultiplier: props.damageMultiplier ?? 0,
        healMultiplier: props.healMultiplier ?? 0,
        createdAt: props.createdAt ?? new Date(),
      },
      id
    )
    return skill
  }
}
