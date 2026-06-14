import { UniqueEntityId } from '../../../core/entities/unique-entity-id'
import { Pillar, Power } from '../../../entities/power'
import type { Power as PowerPrisma } from '../../../generated/prisma'

export class PrismaPowerMapper {
  static toDomain(power: PowerPrisma): Power {
    return Power.create(
      {
        name: power.name,
        description: power.description,
        createdAt: power.createdAt,
        canAwaken: power.canAwaken,
        isAwakened: power.isAwakened,
        pillar: power.pillar as Pillar,
      },
      new UniqueEntityId(power.id)
    )
  }

  static toPrisma(power: Power) {
    return {
      id: power.id.toString(),
      name: power.name,
      description: power.description,
      canAwaken: power.canAwaken,
      isAwakened: power.isAwakened,
      pillar: power.pillar,
      createdAt: power.createdAt,
    }
  }

  static toPrismaUpdate(power: Power) {
    return {
      name: power.name,
      description: power.description,
      canAwaken: power.canAwaken,
      isAwakened: power.isAwakened,
      pillar: power.pillar,
      createdAt: power.createdAt,
    }
  }
}
