import { prisma } from '../../config/prisma'
import type { Team } from '../../entities/team'
import type { ITeamRepository } from '../interface/team-repository'
import { PrismaTeamMapper } from './mappers/prisma-team-mapper'

export class PrismaTeamRepository implements ITeamRepository {
  async create(team: Team): Promise<void> {
    await prisma.team.create({
      data: PrismaTeamMapper.toPrisma(team),
    })
  }

  async findByUserId(userId: string): Promise<Team | null> {
    const data = await prisma.team.findUnique({ where: { userId } })
    if (!data) return null
    return PrismaTeamMapper.toDomain(data)
  }
}
