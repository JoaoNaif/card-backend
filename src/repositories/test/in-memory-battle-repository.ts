import type { Battle } from '../../entities/battle'
import type { IBattleRepository } from '../interface/battle-repository'

export class InMemoryBattleRepository implements IBattleRepository {
  public items: Battle[] = []

  async create(battle: Battle): Promise<void> {
    this.items.push(battle)
  }

  async save(battle: Battle): Promise<void> {
    const index = this.items.findIndex((b) => b.id.equals(battle.id))
    if (index >= 0) {
      this.items[index] = battle
    }
  }

  async delete(battle: Battle): Promise<void> {
    this.items = this.items.filter((b) => !b.id.equals(battle.id))
  }

  async findById(id: string): Promise<Battle | null> {
    return this.items.find((b) => b.id.toString() === id) ?? null
  }
}
