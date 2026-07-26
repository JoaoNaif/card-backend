import { Entity } from '../core/entities/entity'
import type { UniqueEntityId } from '../core/entities/unique-entity-id'

export interface TeamMemberProps {
  teamId: string
  characterId: string
  positionRow: number
  positionCol: number
}

export class TeamMember extends Entity<TeamMemberProps> {
  get teamId() {
    return this.props.teamId
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

  static create(props: TeamMemberProps, id?: UniqueEntityId) {
    return new TeamMember(props, id)
  }
}
