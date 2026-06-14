import { Entity } from '../core/entities/entity'
import type { UniqueEntityId } from '../core/entities/unique-entity-id'
import type { Optional } from '../core/type/optional'

export enum Ranking {
  DISCRETO = 'DISCRETO',
  CONTINUO = 'CONTINUO',
  DIFERENCIAVEL = 'DIFERENCIAVEL',
  NAO_LINEAR = 'NAO_LINEAR',
  SINGULAR = 'SINGULAR',
  DIVERGENTE = 'DIVERGENTE',
  CAOTICO = 'CAOTICO',
}

const RANKING_MAX_LEVEL: Record<Ranking, number> = {
  [Ranking.DISCRETO]: 20,
  [Ranking.CONTINUO]: 40,
  [Ranking.DIFERENCIAVEL]: 60,
  [Ranking.NAO_LINEAR]: 80,
  [Ranking.SINGULAR]: 100,
  [Ranking.DIVERGENTE]: 100,
  [Ranking.CAOTICO]: 100,
}

const GROWTH_RATE = 0.1

export interface CharacterProps {
  name: string
  description: string
  userId?: string | null | undefined
  ranking: Ranking
  maxRanking: Ranking
  level: number
  xp: number
  breakthroughAttempts: number
  baseHp: number
  baseAtk: number
  baseDef: number
  baseSpd: number
  secondaryPowerId?: string | null | undefined
  awakenedPowerId?: string | null | undefined
  powerId: string
  traits?: { id: string; name: string }[]
  createdAt: Date
}

export class Character extends Entity<CharacterProps> {
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

  get userId() {
    return this.props.userId
  }

  set userId(userId: string | null | undefined) {
    this.props.userId = userId
  }

  get ranking() {
    return this.props.ranking
  }

  set ranking(ranking: Ranking) {
    this.props.ranking = ranking
  }

  get maxRanking() {
    return this.props.maxRanking
  }

  get level() {
    return this.props.level
  }

  get xp() {
    return this.props.xp
  }

  get breakthroughAttempts() {
    return this.props.breakthroughAttempts
  }

  set breakthroughAttempts(breakthroughAttempts: number) {
    this.props.breakthroughAttempts = breakthroughAttempts
  }

  get baseHp() {
    return this.props.baseHp
  }

  get baseAtk() {
    return this.props.baseAtk
  }

  get baseDef() {
    return this.props.baseDef
  }

  get baseSpd() {
    return this.props.baseSpd
  }

  get secondaryPowerId() {
    return this.props.secondaryPowerId
  }

  get awakenedPowerId() {
    return this.props.awakenedPowerId
  }

  set awakenedPowerId(id: string) {
    this.props.awakenedPowerId = id
  }

  get traits(): { id: string; name: string }[] {
    return this.props.traits ?? []
  }

  get maxLevel(): number {
    return RANKING_MAX_LEVEL[this.props.ranking]
  }

  get xpToNextLevel(): number {
    return this.props.level * 100
  }

  get effectiveHp(): number {
    return this.calcEffective(this.props.baseHp)
  }

  get effectiveAtk(): number {
    return this.calcEffective(this.props.baseAtk)
  }

  get effectiveDef(): number {
    return this.calcEffective(this.props.baseDef)
  }

  get effectiveSpd(): number {
    return this.calcEffective(this.props.baseSpd)
  }

  private calcEffective(base: number): number {
    return base + Math.floor(base * GROWTH_RATE * (this.props.level - 1))
  }

  gainXp(amount: number): number {
    this.props.xp += amount
    let levelsGained = 0

    while (
      this.props.level < this.maxLevel &&
      this.props.xp >= this.xpToNextLevel
    ) {
      this.props.xp -= this.xpToNextLevel
      this.props.level++
      levelsGained++
    }

    if (this.props.level >= this.maxLevel) {
      this.props.xp = 0
    }

    return levelsGained
  }

  get powerId() {
    return this.props.powerId
  }

  get createdAt() {
    return this.props.createdAt
  }

  static create(
    props: Optional<CharacterProps, 'createdAt'>,
    id?: UniqueEntityId
  ) {
    const character = new Character(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
      },
      id
    )

    return character
  }
}
