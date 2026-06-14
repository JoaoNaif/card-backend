import { UniqueEntityId } from '../../../core/entities/unique-entity-id'
import { Skill, StatType } from '../../../entities/skill'
import type { Skill as SkillPrisma } from '../../../generated/prisma'

export class PrismaSkillMapper {
  static toDomain(skill: SkillPrisma): Skill {
    return Skill.create(
      {
        name: skill.name,
        description: skill.description,
        limitation: skill.limitation,
        cooldownTurns: skill.cooldownTurns,
        debuffDuration: skill.debuffDuration,
        debuffStat: skill.debuffStat as StatType,
        debuffValue: skill.debuffValue,
        appliesBattleFieldId: skill.appliesBattleFieldId,
        fieldDuration: skill.fieldDuration,
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
      limitation: skill.limitation,
      cooldownTurns: skill.cooldownTurns,
      debuffDuration: skill.debuffDuration,
      debuffStat: skill.debuffStat,
      debuffValue: skill.debuffValue,
      appliesBattleFieldId: skill.appliesBattleFieldId,
      fieldDuration: skill.fieldDuration,
      powerId: skill.powerId,
      minLevel: skill.minLevel,
      createdAt: skill.createdAt,
    }
  }

  static toPrismaUpdate(skill: Skill) {
    return {
      name: skill.name,
      description: skill.description,
      limitation: skill.limitation,
      cooldownTurns: skill.cooldownTurns,
      debuffDuration: skill.debuffDuration,
      debuffStat: skill.debuffStat,
      debuffValue: skill.debuffValue,
      appliesBattleFieldId: skill.appliesBattleFieldId,
      fieldDuration: skill.fieldDuration,
      powerId: skill.powerId,
      minLevel: skill.minLevel,
      createdAt: skill.createdAt,
    }
  }
}
