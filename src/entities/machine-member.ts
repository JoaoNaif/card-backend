import { Entity } from '../core/entities/entity'
import type { UniqueEntityId } from '../core/entities/unique-entity-id'

export interface MachineMemberProps {
  machineId: string
  characterId: string
  positionRow: number
  positionCol: number
}

export class MachineMember extends Entity<MachineMemberProps> {
  get machineId() {
    return this.props.machineId
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

  static create(props: MachineMemberProps, id?: UniqueEntityId) {
    return new MachineMember(props, id)
  }
}
