import { UniqueEntityId } from '../../../core/entities/unique-entity-id'
import { Skill } from '../../../entities/skill'
import type { Skill as SkillPrisma } from '../../../generated/prisma'

export class PrismaSkillMapper {
  static toDomain(skill: SkillPrisma): Skill {
    return Skill.create(
      {
        name: skill.name,
        description: skill.description,
        cost: skill.cost,
        limitation: skill.limitation,
        powerId: skill.powerId,
        minLevel: skill.minLevel,
        createdAt: skill.createdAt,
      },
      new UniqueEntityId(skill.id)
    )
  }

  static toPrisma(skill: Skill) {
    return {
      id: skill.id.toString(),
      name: skill.name,
      description: skill.description,
      cost: skill.cost,
      limitation: skill.limitation,
      powerId: skill.powerId,
      minLevel: skill.minLevel,
      createdAt: skill.createdAt,
    }
  }

  static toPrismaUpdate(skill: Skill) {
    return {
      name: skill.name,
      description: skill.description,
      cost: skill.cost,
      limitation: skill.limitation,
      powerId: skill.powerId,
      minLevel: skill.minLevel,
      createdAt: skill.createdAt,
    }
  }
}
