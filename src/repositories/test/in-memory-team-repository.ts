import type { Team } from '../../entities/team'
import type { ITeamRepository } from '../interface/team-repository'

export class InMemoryTeamRepository implements ITeamRepository {
  public items: Team[] = []

  async create(team: Team): Promise<void> {
    this.items.push(team)
  }

  async findByUserId(userId: string): Promise<Team | null> {
    return this.items.find((t) => t.userId === userId) ?? null
  }
}
