import { Entity } from '../core/entities/entity'
import type { UniqueEntityId } from '../core/entities/unique-entity-id'
import type { Optional } from '../core/type/optional'

export interface TraitProps {
  name: string
  description: string
  createdAt: Date
}

export class Trait extends Entity<TraitProps> {
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

  get createdAt() {
    return this.props.createdAt
  }

  static create(props: Optional<TraitProps, 'createdAt'>, id?: UniqueEntityId) {
    const trait = new Trait(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
      },
      id
    )
    return trait
  }
}
