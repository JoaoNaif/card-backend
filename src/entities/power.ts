import { Entity } from '../core/entities/entity'
import type { UniqueEntityId } from '../core/entities/unique-entity-id'
import type { Optional } from '../core/type/optional'

export enum Pillar {
  MATERIAL = 'MATERIAL',
  VETORIAL = 'VETORIAL',
  BIOLOGICA = 'BIOLOGICA',
  PSIQUICA = 'PSIQUICA',
  FUNDAMENTAL = 'FUNDAMENTAL',
}
export interface PowerProps {
  name: string
  description: string
  pillar: Pillar
  canAwaken: boolean
  isAwakened: boolean
  createdAt: Date
}

export class Power extends Entity<PowerProps> {
  get name() {
    return this.props.name
  }

  get description() {
    return this.props.description
  }

  get pillar() {
    return this.props.pillar
  }

  get canAwaken() {
    return this.props.canAwaken
  }

  get isAwakened() {
    return this.props.isAwakened
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
