import { Entity } from '../core/entities/entity'
import type { UniqueEntityId } from '../core/entities/unique-entity-id'
import type { Optional } from '../core/type/optional'

export enum Ranking {
  MORTAL = 'MORTAL',
  DESBRAVADOR = 'DESBRAVADOR',
  HEROI = 'HEROI',
  EPICO = 'EPICO',
  LENDARIO = 'LENDARIO',
  MITICO = 'MITICO',
  ANCESTRAL = 'ANCESTRAL',
}

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
  powerId: string
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

  set level(level: number) {
    this.props.level = level
  }

  get xp() {
    return this.props.xp
  }

  set xp(xp: number) {
    this.props.xp = xp
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

  set baseHp(baseHp: number) {
    this.props.baseHp = baseHp
  }

  get baseAtk() {
    return this.props.baseAtk
  }

  set baseAtk(baseAtk: number) {
    this.props.baseAtk = baseAtk
  }

  get baseDef() {
    return this.props.baseDef
  }

  set baseDef(baseDef: number) {
    this.props.baseDef = baseDef
  }

  get baseSpd() {
    return this.props.baseSpd
  }

  set baseSpd(baseSpd: number) {
    this.props.baseSpd = baseSpd
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
