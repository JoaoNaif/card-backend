import { UniqueEntityId } from '../../../core/entities/unique-entity-id'
import { PowerAwakening } from '../../../entities/power-awakening'
import type { PowerAwakening as PowerAwakeningPrisma } from '../../../generated/prisma'

export class PrismaPowerAwakeningMapper {
  static toDomain(powerAwakening: PowerAwakeningPrisma): PowerAwakening {
    return PowerAwakening.create(
      {
        awakenedPowerId: powerAwakening.awakenedPowerId,
        basePowerId: powerAwakening.basePowerId,
      },
      new UniqueEntityId(powerAwakening.id)
    )
  }

  static toPrisma(powerAwakening: PowerAwakening) {
    return {
      id: powerAwakening.id.toString(),
      awakenedPowerId: powerAwakening.awakenedPowerId,
      basePowerId: powerAwakening.basePowerId,
    }
  }

  static toPrismaUpdate(powerAwakening: PowerAwakening) {
    return {
      id: powerAwakening.id.toString(),
      awakenedPowerId: powerAwakening.awakenedPowerId,
      basePowerId: powerAwakening.basePowerId,
    }
  }
}
