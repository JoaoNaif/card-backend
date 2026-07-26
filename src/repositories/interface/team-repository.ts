import type { Team } from '../../entities/team'

export interface ITeamRepository {
  create(team: Team): Promise<void>
  findByUserId(userId: string): Promise<Team | null>
}
