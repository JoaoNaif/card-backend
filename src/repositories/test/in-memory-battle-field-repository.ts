import type { BattleField } from '../../entities/battle-field'
import type { IBattleFieldRepository } from '../interface/battle-field-repository'

export class InMemoryBattleFieldRepository implements IBattleFieldRepository {
  public items: BattleField[] = []

  async create(battleField: BattleField): Promise<void> {
    this.items.push(battleField)
  }

  async findById(id: string): Promise<BattleField | null> {
    return this.items.find((b) => b.id.toString() === id) ?? null
  }

  async findByName(name: string): Promise<BattleField | null> {
    return this.items.find((b) => b.name === name) ?? null
  }

  async findRandom(): Promise<BattleField | null> {
    if (this.items.length === 0) return null
    const index = Math.floor(Math.random() * this.items.length)
    return this.items[index] ?? null
  }

  async findAll(search = '', page = 1, limit = 20): Promise<BattleField[]> {
    const start = (page - 1) * limit
    return this.items
      .filter((b) => b.name.toLowerCase().includes(search.toLowerCase()))
      .slice(start, start + limit)
  }

  async save(battleField: BattleField): Promise<void> {
    const index = this.items.findIndex((b) => b.id.equals(battleField.id))
    if (index >= 0) {
      this.items[index] = battleField
    }
  }

  async delete(battleField: BattleField): Promise<void> {
    this.items = this.items.filter((b) => !b.id.equals(battleField.id))
  }
}
