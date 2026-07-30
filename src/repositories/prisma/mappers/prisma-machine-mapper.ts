import { UniqueEntityId } from '../../../core/entities/unique-entity-id'
import { Machine } from '../../../entities/machine'
import type { Machine as MachinePrisma } from '../../../generated/prisma'

export class PrismaMachineMapper {
  static toDomain(data: MachinePrisma): Machine {
    return Machine.create(
      {
        label: data.label,
        name: data.name,
        createdAt: data.createdAt,
      },
      new UniqueEntityId(data.id)
    )
  }

  static toPrisma(machine: Machine) {
    return {
      id: machine.id.toString(),
      label: machine.label,
      name: machine.name,
      createdAt: machine.createdAt,
    }
  }
}
