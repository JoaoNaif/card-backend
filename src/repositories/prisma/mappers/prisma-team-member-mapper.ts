import { UniqueEntityId } from '../../../core/entities/unique-entity-id'
import { TeamMember } from '../../../entities/team-member'
import type { TeamMember as TeamMemberPrisma } from '../../../generated/prisma'

export class PrismaTeamMemberMapper {
  static toDomain(data: TeamMemberPrisma): TeamMember {
    return TeamMember.create(
      {
        teamId: data.teamId,
        characterId: data.characterId,
        positionRow: data.positionRow,
        positionCol: data.positionCol,
      },
      new UniqueEntityId(data.id)
    )
  }

  static toPrisma(teamMember: TeamMember) {
    return {
      id: teamMember.id.toString(),
      teamId: teamMember.teamId,
      characterId: teamMember.characterId,
      positionRow: teamMember.positionRow,
      positionCol: teamMember.positionCol,
    }
  }
}
