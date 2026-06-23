import { UniqueEntityId } from '../../../core/entities/unique-entity-id'
import { Skill, StatType, TargetType } from '../../../entities/skill'
import type { Skill as SkillPrisma } from '../../../generated/prisma'

export class PrismaSkillMapper {
  static toDomain(skill: SkillPrisma): Skill {
    return Skill.create(
      {
        name: skill.name,
        description: skill.description,
        limitation: skill.limitation,
        cooldownTurns: skill.cooldownTurns,
        debuffStat: skill.debuffStat as StatType,
        debuffValue: skill.debuffValue,
        debuffDuration: skill.debuffDuration,
        targetType: skill.targetType as TargetType,
        damageMultiplier: skill.damageMultiplier,
        healMultiplier: skill.healMultiplier,
        targetEffectStat: skill.targetEffectStat as StatType | null,
        targetEffectValue: skill.targetEffectValue,
        targetEffectDuration: skill.targetEffectDuration,
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
      debuffStat: skill.debuffStat,
      debuffValue: skill.debuffValue,
      debuffDuration: skill.debuffDuration,
      targetType: skill.targetType,
      damageMultiplier: skill.damageMultiplier,
      healMultiplier: skill.healMultiplier,
      targetEffectStat: skill.targetEffectStat ?? null,
      targetEffectValue: skill.targetEffectValue ?? null,
      targetEffectDuration: skill.targetEffectDuration ?? null,
      appliesBattleFieldId: skill.appliesBattleFieldId ?? null,
      fieldDuration: skill.fieldDuration ?? null,
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
      debuffStat: skill.debuffStat,
      debuffValue: skill.debuffValue,
      debuffDuration: skill.debuffDuration,
      targetType: skill.targetType,
      damageMultiplier: skill.damageMultiplier,
      healMultiplier: skill.healMultiplier,
      targetEffectStat: skill.targetEffectStat ?? null,
      targetEffectValue: skill.targetEffectValue ?? null,
      targetEffectDuration: skill.targetEffectDuration ?? null,
      appliesBattleFieldId: skill.appliesBattleFieldId ?? null,
      fieldDuration: skill.fieldDuration ?? null,
      powerId: skill.powerId,
      minLevel: skill.minLevel,
      createdAt: skill.createdAt,
    }
  }
}
