import type { TeamMember } from '../../entities/team-member'
import type { ITeamMemberRepository } from '../interface/team-member-repository'

export class InMemoryTeamMemberRepository implements ITeamMemberRepository {
  public items: TeamMember[] = []

  async create(teamMember: TeamMember): Promise<void> {
    this.items.push(teamMember)
  }

  async delete(teamMember: TeamMember): Promise<void> {
    this.items = this.items.filter((m) => !m.id.equals(teamMember.id))
  }

  async findById(id: string): Promise<TeamMember | null> {
    return this.items.find((m) => m.id.toString() === id) ?? null
  }

  async findAllByTeamId(teamId: string): Promise<TeamMember[]> {
    return this.items.filter((m) => m.teamId === teamId)
  }

  async findByTeamIdAndCharacterId(
    teamId: string,
    characterId: string
  ): Promise<TeamMember | null> {
    return (
      this.items.find(
        (m) => m.teamId === teamId && m.characterId === characterId
      ) ?? null
    )
  }

  async findByTeamIdAndPosition(
    teamId: string,
    positionRow: number,
    positionCol: number
  ): Promise<TeamMember | null> {
    return (
      this.items.find(
        (m) =>
          m.teamId === teamId &&
          m.positionRow === positionRow &&
          m.positionCol === positionCol
      ) ?? null
    )
  }
}
