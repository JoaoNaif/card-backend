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

  set name(name: string) {
    this.props.name = name
  }

  get description() {
    return this.props.description
  }

  set description(description: string) {
    this.props.description = description
  }

  get limitation() {
    return this.props.limitation
  }

  set limitation(limitation: string) {
    this.props.limitation = limitation
  }

  get minLevel() {
    return this.props.minLevel
  }

  set minLevel(minLevel: number) {
    this.props.minLevel = minLevel
  }

  get powerId() {
    return this.props.powerId
  }

  set powerId(powerId: string) {
    this.props.powerId = powerId
  }

  get appliesBattleFieldId(): string | null {
    return this.props.appliesBattleFieldId ?? null
  }

  set appliesBattleFieldId(appliesBattleFieldId: string | null) {
    this.props.appliesBattleFieldId = appliesBattleFieldId
  }

  get fieldDuration(): number | null {
    return this.props.fieldDuration ?? null
  }

  set fieldDuration(fieldDuration: number | null) {
    this.props.fieldDuration = fieldDuration
  }

  get cooldownTurns() {
    return this.props.cooldownTurns
  }

  set cooldownTurns(cooldownTurns: number) {
    this.props.cooldownTurns = cooldownTurns
  }

  get debuffStat() {
    return this.props.debuffStat
  }

  set debuffStat(debuffStat: StatType) {
    this.props.debuffStat = debuffStat
  }

  get debuffValue() {
    return this.props.debuffValue
  }

  set debuffValue(debuffValue: number) {
    this.props.debuffValue = debuffValue
  }

  get debuffDuration() {
    return this.props.debuffDuration
  }

  set debuffDuration(debuffDuration: number) {
    this.props.debuffDuration = debuffDuration
  }

  get targetType() {
    return this.props.targetType
  }

  set targetType(targetType: TargetType) {
    this.props.targetType = targetType
  }

  get damageMultiplier() {
    return this.props.damageMultiplier
  }

  set damageMultiplier(damageMultiplier: number) {
    this.props.damageMultiplier = damageMultiplier
  }

  get healMultiplier() {
    return this.props.healMultiplier
  }

  set healMultiplier(healMultiplier: number) {
    this.props.healMultiplier = healMultiplier
  }

  get targetEffectStat(): StatType | null {
    return this.props.targetEffectStat ?? null
  }

  set targetEffectStat(targetEffectStat: StatType | null) {
    this.props.targetEffectStat = targetEffectStat
  }

  get targetEffectValue(): number | null {
    return this.props.targetEffectValue ?? null
  }

  set targetEffectValue(targetEffectValue: number | null) {
    this.props.targetEffectValue = targetEffectValue
  }

  get targetEffectDuration(): number | null {
    return this.props.targetEffectDuration ?? null
  }

  set targetEffectDuration(targetEffectDuration: number | null) {
    this.props.targetEffectDuration = targetEffectDuration
  }

  get createdAt() {
    return this.props.createdAt
  }

  static create(
    props: Optional<
      SkillProps,
      'createdAt' | 'targetType' | 'damageMultiplier' | 'healMultiplier'
    >,
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
