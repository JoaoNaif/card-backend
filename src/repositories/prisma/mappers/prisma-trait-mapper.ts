import { UniqueEntityId } from '../../../core/entities/unique-entity-id'
import { Trait } from '../../../entities/trait'
import type { Trait as TraitPrisma } from '../../../generated/prisma'

export class PrismaTraitMapper {
  static toDomain(trait: TraitPrisma): Trait {
    return Trait.create(
      {
        name: trait.name,
        description: trait.description,
        createdAt: trait.createdAt,
      },
      new UniqueEntityId(trait.id)
    )
  }

  static toPrisma(trait: Trait) {
    return {
      id: trait.id.toString(),
      name: trait.name,
      description: trait.description,
      createdAt: trait.createdAt,
    }
  }

  static toPrismaUpdate(trait: Trait) {
    return {
      name: trait.name,
      description: trait.description,
      createdAt: trait.createdAt,
    }
  }
}
