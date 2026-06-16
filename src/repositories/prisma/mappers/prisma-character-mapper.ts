import { UniqueEntityId } from '../../../core/entities/unique-entity-id'
import { Character, Ranking } from '../../../entities/character'
import type { Character as CharacterPrisma } from '../../../generated/prisma'

export class PrismaCharacterMapper {
  static toDomain(
    raw: CharacterPrisma,
    traits?: { id: string; name: string }[]
  ): Character {
    return Character.create(
      {
        name: raw.name,
        description: raw.description,
        userId: raw.userId,
        ranking: raw.ranking as Ranking,
        maxRanking: raw.maxRanking as Ranking,
        level: raw.level,
        xp: raw.xp,
        breakthroughAttempts: raw.breakthroughAttempts,
        baseHp: raw.baseHp,
        baseAtk: raw.baseAtk,
        baseDef: raw.baseDef,
        baseSpd: raw.baseSpd,
        powerId: raw.powerId,
        pendingSkillSelections: raw.pendingSkillSelections,
        traits: traits ?? [],
        createdAt: raw.createdAt,
      },
      new UniqueEntityId(raw.id)
    )
  }

  static toPrisma(character: Character) {
    return {
      id: character.id.toString(),
      name: character.name,
      description: character.description,
      userId: character.userId ?? null,
      ranking: character.ranking,
      maxRanking: character.maxRanking,
      level: character.level,
      xp: character.xp,
      breakthroughAttempts: character.breakthroughAttempts,
      baseHp: character.baseHp,
      baseAtk: character.baseAtk,
      baseDef: character.baseDef,
      baseSpd: character.baseSpd,
      powerId: character.powerId,
      pendingSkillSelections: character.pendingSkillSelections,
      createdAt: character.createdAt,
    }
  }

  static toPrismaUpdate(character: Character) {
    return {
      name: character.name,
      description: character.description,
      userId: character.userId ?? null,
      ranking: character.ranking,
      maxRanking: character.maxRanking,
      level: character.level,
      xp: character.xp,
      breakthroughAttempts: character.breakthroughAttempts,
      baseHp: character.baseHp,
      baseAtk: character.baseAtk,
      baseDef: character.baseDef,
      baseSpd: character.baseSpd,
      powerId: character.powerId,
      pendingSkillSelections: character.pendingSkillSelections,
      createdAt: character.createdAt,
    }
  }
}
