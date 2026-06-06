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
    await prisma.skill.delete({
      where: { id },
    })
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
}
