import { Entity } from '../core/entities/entity'
import type { UniqueEntityId } from '../core/entities/unique-entity-id'

export interface PowerAwakeningProps {
  basePowerId: string
  awakenedPowerId: string
}

export class PowerAwakening extends Entity<PowerAwakeningProps> {
  get basePowerId() {
    return this.props.basePowerId
  }

  get awakenedPowerId() {
    return this.props.awakenedPowerId
  }

  static create(props: PowerAwakeningProps, id?: UniqueEntityId) {
    return new PowerAwakening(props, id)
  }
}
