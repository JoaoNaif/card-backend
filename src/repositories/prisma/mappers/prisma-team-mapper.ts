import { UniqueEntityId } from '../../../core/entities/unique-entity-id'
import { Team } from '../../../entities/team'
import type { Team as TeamPrisma } from '../../../generated/prisma'

export class PrismaTeamMapper {
  static toDomain(data: TeamPrisma): Team {
    return Team.create(
      {
        userId: data.userId,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      },
      new UniqueEntityId(data.id)
    )
  }

  static toPrisma(team: Team) {
    return {
      id: team.id.toString(),
      userId: team.userId,
      createdAt: team.createdAt,
      updatedAt: team.updatedAt,
    }
  }
}
