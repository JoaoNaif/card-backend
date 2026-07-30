import { Entity } from '../core/entities/entity'
import type { UniqueEntityId } from '../core/entities/unique-entity-id'
import type { Optional } from '../core/type/optional'

export interface MachineProps {
  label: string
  name: string
  createdAt: Date
}

export class Machine extends Entity<MachineProps> {
  get label() {
    return this.props.label
  }

  get name() {
    return this.props.name
  }

  get createdAt() {
    return this.props.createdAt
  }

  static create(
    props: Optional<MachineProps, 'createdAt'>,
    id?: UniqueEntityId
  ) {
    return new Machine(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
      },
      id
    )
  }
}
