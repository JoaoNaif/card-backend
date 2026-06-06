import { Entity } from '../core/entities/entity'
import type { UniqueEntityId } from '../core/entities/unique-entity-id'
import type { Optional } from '../core/type/optional'

export interface SkillProps {
  name: string
  description: string
  limitation: string
  cost: number
  minLevel: number
  powerId: string
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

  get cost() {
    return this.props.cost
  }

  get minLevel() {
    return this.props.minLevel
  }

  get powerId() {
    return this.props.powerId
  }

  get createdAt() {
    return this.props.createdAt
  }

  static create(props: Optional<SkillProps, 'createdAt'>, id?: UniqueEntityId) {
    const skill = new Skill(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
      },
      id
    )
    return skill
  }
}
