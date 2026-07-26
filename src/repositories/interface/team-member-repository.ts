import type { TeamMember } from '../../entities/team-member'

export interface ITeamMemberRepository {
  create(teamMember: TeamMember): Promise<void>
  delete(teamMember: TeamMember): Promise<void>
  findById(id: string): Promise<TeamMember | null>
  findAllByTeamId(teamId: string): Promise<TeamMember[]>
  findByTeamIdAndCharacterId(
    teamId: string,
    characterId: string
  ): Promise<TeamMember | null>
  findByTeamIdAndPosition(
    teamId: string,
    positionRow: number,
    positionCol: number
  ): Promise<TeamMember | null>
}
