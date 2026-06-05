import { Entity } from '../core/entities/entity'
import type { UniqueEntityId } from '../core/entities/unique-entity-id'
import type { Optional } from '../core/type/optional'

export interface PowerProps {
  name: string
  description: string
  createdAt: Date
}

export class Power extends Entity<PowerProps> {
  get name() {
    return this.props.name
  }

  get description() {
    return this.props.description
  }

  get createdAt() {
    return this.props.createdAt
  }

  static create(props: Optional<PowerProps, 'createdAt'>, id?: UniqueEntityId) {
    const power = new Power(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
      },
      id
    )
    return power
  }
}
