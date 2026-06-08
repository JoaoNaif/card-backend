import { CharacterSkill } from '../../../entities/character-skill'
import type { CharacterSkill as CharacterSkillPrisma } from '../../../generated/prisma'

export class PrismaCharacterSkillMapper {
  static toDomain(raw: CharacterSkillPrisma): CharacterSkill {
    return CharacterSkill.create({
      characterId: raw.characterId,
      skillId: raw.skillId,
      assignedAt: raw.assignedAt,
    })
  }

  static toPrisma(characterSkill: CharacterSkill) {
    return {
      characterId: characterSkill.characterId,
      skillId: characterSkill.skillId,
      assignedAt: characterSkill.assignedAt,
    }
  }
}
