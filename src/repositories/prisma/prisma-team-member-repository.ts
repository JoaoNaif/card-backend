import { prisma } from '../../config/prisma'
import type { TeamMember } from '../../entities/team-member'
import type { ITeamMemberRepository } from '../interface/team-member-repository'
import { PrismaTeamMemberMapper } from './mappers/prisma-team-member-mapper'

export class PrismaTeamMemberRepository implements ITeamMemberRepository {
  async create(teamMember: TeamMember): Promise<void> {
    await prisma.teamMember.create({
      data: PrismaTeamMemberMapper.toPrisma(teamMember),
    })
  }

  async save(teamMember: TeamMember): Promise<void> {
    await prisma.teamMember.update({
      where: { id: teamMember.id.toString() },
      data: PrismaTeamMemberMapper.toPrisma(teamMember),
    })
  }

  async delete(teamMember: TeamMember): Promise<void> {
    await prisma.teamMember.delete({
      where: { id: teamMember.id.toString() },
    })
  }

  async findById(id: string): Promise<TeamMember | null> {
    const data = await prisma.teamMember.findUnique({ where: { id } })
    if (!data) return null
    return PrismaTeamMemberMapper.toDomain(data)
  }

  async findAllByTeamId(teamId: string): Promise<TeamMember[]> {
    const data = await prisma.teamMember.findMany({ where: { teamId } })
    return data.map(PrismaTeamMemberMapper.toDomain)
  }

  async findByTeamIdAndCharacterId(
    teamId: string,
    characterId: string
  ): Promise<TeamMember | null> {
    const data = await prisma.teamMember.findFirst({
      where: { teamId, characterId },
    })
    if (!data) return null
    return PrismaTeamMemberMapper.toDomain(data)
  }

  async findByTeamIdAndPosition(
    teamId: string,
    positionRow: number,
    positionCol: number
  ): Promise<TeamMember | null> {
    const data = await prisma.teamMember.findFirst({
      where: { teamId, positionRow, positionCol },
    })
    if (!data) return null
    return PrismaTeamMemberMapper.toDomain(data)
  }
}
