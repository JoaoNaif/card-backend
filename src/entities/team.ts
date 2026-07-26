import { Entity } from '../core/entities/entity'
import type { UniqueEntityId } from '../core/entities/unique-entity-id'
import type { Optional } from '../core/type/optional'

export { TEAM_GRID_SIZE, TEAM_MAX_MEMBERS } from '../core/constants/team-grid'

export interface TeamProps {
  userId: string
  createdAt: Date
  updatedAt: Date
}

export class Team extends Entity<TeamProps> {
  get userId() {
    return this.props.userId
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt
  }

  static create(
    props: Optional<TeamProps, 'createdAt' | 'updatedAt'>,
    id?: UniqueEntityId
  ) {
    return new Team(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
      },
      id
    )
  }
}
