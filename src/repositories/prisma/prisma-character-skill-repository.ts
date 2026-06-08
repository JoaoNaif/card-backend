import { prisma } from '../../config/prisma'
import type { CharacterSkill } from '../../entities/character-skill'
import type { ICharacterSkillRepository } from '../interface/character-skill-repository'
import { PrismaCharacterSkillMapper } from './mappers/prisma-character-skill-mapper'

export class PrismaCharacterSkillRepository implements ICharacterSkillRepository {
  async create(characterSkill: CharacterSkill): Promise<void> {
    await prisma.characterSkill.create({
      data: PrismaCharacterSkillMapper.toPrisma(characterSkill),
    })
  }

  async delete(characterSkill: CharacterSkill): Promise<void> {
    await prisma.characterSkill.delete({
      where: {
        characterId_skillId: {
          characterId: characterSkill.characterId,
          skillId: characterSkill.skillId,
        },
      },
    })
  }

  async findByIds(
    characterId: string,
    skillId: string
  ): Promise<CharacterSkill | null> {
    const raw = await prisma.characterSkill.findUnique({
      where: {
        characterId_skillId: { characterId, skillId },
      },
    })

    if (!raw) return null

    return PrismaCharacterSkillMapper.toDomain(raw)
  }

  async findAllByCharacterId(characterId: string): Promise<CharacterSkill[]> {
    const rows = await prisma.characterSkill.findMany({
      where: { characterId },
    })

    return rows.map(PrismaCharacterSkillMapper.toDomain)
  }
}
