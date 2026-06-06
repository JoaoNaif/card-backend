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
  userId?: string | null
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

  get description() {
    return this.props.description
  }

  get userId() {
    return this.props.userId
  }

  get ranking() {
    return this.props.ranking
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
