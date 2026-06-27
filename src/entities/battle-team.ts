import { Entity } from '../core/entities/entity'
import type { UniqueEntityId } from '../core/entities/unique-entity-id'

export interface BattleTeamProps {
  battleId: string
  teamNumber: number
  userId: string | null | undefined
}

export class BattleTeam extends Entity<BattleTeamProps> {
  get battleId() {
    return this.props.battleId
  }

  get teamNumber() {
    return this.props.teamNumber
  }

  get userId() {
    return this.props.userId
  }

  static create(props: BattleTeamProps, id?: UniqueEntityId) {
    return new BattleTeam(props, id)
  }
}
