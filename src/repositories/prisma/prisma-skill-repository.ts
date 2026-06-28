import { prisma } from '../../config/prisma'
import type { Skill } from '../../entities/skill'
import type { ISkillRepository } from '../interface/skill-repository'
import { PrismaSkillMapper } from './mappers/prisma-skill-mapper'

export class PrismaSkillRepository implements ISkillRepository {
  async create(skill: Skill): Promise<void> {
    const data = PrismaSkillMapper.toPrisma(skill)

    await prisma.skill.create({
      data,
    })
  }

  async save(skill: Skill): Promise<void> {
    const id = skill.id.toString()
    await prisma.skill.update({
      where: { id },
      data: PrismaSkillMapper.toPrismaUpdate(skill),
    })
  }

  async delete(skill: Skill): Promise<void> {
    const id = skill.id.toString()
    await prisma.$transaction([
      prisma.characterSkill.deleteMany({ where: { skillId: id } }),
      prisma.skill.delete({ where: { id } }),
    ])
  }

  async findById(id: string): Promise<Skill | null> {
    const data = await prisma.skill.findUnique({
      where: { id },
    })

    if (!data) {
      return null
    }

    return PrismaSkillMapper.toDomain(data)
  }

  async findByName(name: string): Promise<Skill | null> {
    const data = await prisma.skill.findUnique({
      where: { name },
    })

    if (!data) {
      return null
    }

    return PrismaSkillMapper.toDomain(data)
  }

  async findAll(search: string, page: number, limit: number): Promise<Skill[]> {
    const data = await prisma.skill.findMany({
      where: { name: { contains: search } },
      take: limit,
      skip: (page - 1) * limit,
    })

    return data.map(PrismaSkillMapper.toDomain)
  }

  async findManyByCharacterIds(ids: string[]): Promise<Record<string, Skill[]>> {
    const data = await prisma.characterSkill.findMany({
      where: { characterId: { in: ids } },
      include: { skill: true },
    })

    const result: Record<string, Skill[]> = {}
    for (const id of ids) {
      result[id] = []
    }
    for (const item of data) {
      result[item.characterId]!.push(PrismaSkillMapper.toDomain(item.skill))
    }
    return result
  }

  async findEligibleForCharacter(
    powerIds: string[],
    characterLevel: number,
    excludeSkillIds: string[]
  ): Promise<Skill[]> {
    const data = await prisma.skill.findMany({
      where: {
        powerId: { in: powerIds },
        minLevel: { lte: characterLevel },
        id: { notIn: excludeSkillIds },
      },
    })

    return data.map(PrismaSkillMapper.toDomain)
  }
}
