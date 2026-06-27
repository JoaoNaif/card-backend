import { Entity } from '../core/entities/entity'
import type { UniqueEntityId } from '../core/entities/unique-entity-id'

export interface BattleParticipantProps {
  battleTeamId: string
  characterId: string
  positionRow: number
  positionCol: number
}

export class BattleParticipant extends Entity<BattleParticipantProps> {
  get battleTeamId() {
    return this.props.battleTeamId
  }

  get characterId() {
    return this.props.characterId
  }

  get positionRow() {
    return this.props.positionRow
  }

  get positionCol() {
    return this.props.positionCol
  }

  static create(props: BattleParticipantProps, id?: UniqueEntityId) {
    return new BattleParticipant(props, id)
  }
}
