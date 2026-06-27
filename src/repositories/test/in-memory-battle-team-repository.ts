import type { BattleTeam } from '../../entities/battle-team'
import type { IBattleTeamRepository } from '../interface/battle-team-repository'

export class InMemoryBattleTeamRepository implements IBattleTeamRepository {
  public items: BattleTeam[] = []

  async create(battleTeam: BattleTeam): Promise<void> {
    this.items.push(battleTeam)
  }

  async save(battleTeam: BattleTeam): Promise<void> {
    const index = this.items.findIndex((t) => t.id.equals(battleTeam.id))
    if (index >= 0) {
      this.items[index] = battleTeam
    }
  }

  async delete(battleTeam: BattleTeam): Promise<void> {
    this.items = this.items.filter((t) => !t.id.equals(battleTeam.id))
  }

  async findById(id: string): Promise<BattleTeam | null> {
    return this.items.find((t) => t.id.toString() === id) ?? null
  }
}
