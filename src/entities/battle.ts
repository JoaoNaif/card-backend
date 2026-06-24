import { Entity } from '../core/entities/entity'
import type { UniqueEntityId } from '../core/entities/unique-entity-id'
import type { Optional } from '../core/type/optional'

export enum BattleMode {
  AUTO = 'AUTO',
  PVE = 'PVE',
  PVP = 'PVP',
}

export enum BattleStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  ABANDONED = 'ABANDONED',
}

export interface BattleProps {
  mode: BattleMode
  status: BattleStatus
  battleFieldId: string
  winnerTerm?: number | null | undefined
  totalTurns: number
  maxTurns?: number | null | undefined
  log: string[]
  sessionState?: string[] | null | undefined
  createdAt: Date
  updatedAt: Date
}

export class Battle extends Entity<BattleProps> {
  get mode() {
    return this.props.mode
  }

  get status() {
    return this.props.status
  }

  get battleFieldId() {
    return this.props.battleFieldId
  }

  get winnerTerm() {
    return this.props.winnerTerm
  }

  get totalTurns() {
    return this.props.totalTurns
  }

  get maxTurns() {
    return this.props.maxTurns
  }

  get log() {
    return this.props.log
  }

  get sessionState() {
    return this.props.sessionState
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt
  }

  static create(
    props: Optional<
      BattleProps,
      'createdAt' | 'totalTurns' | 'log' | 'updatedAt'
    >,
    id?: UniqueEntityId
  ) {
    const battle = new Battle(
      {
        ...props,
        totalTurns: props.totalTurns ?? 0,
        log: props.log ?? [],
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
      },
      id
    )

    return battle
  }
}
