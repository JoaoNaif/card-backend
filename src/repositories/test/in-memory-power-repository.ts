import type { Power } from '../../entities/power'
import type { IPowerRepository } from '../interface/power-repository'

export class InMemoryPowerRepository implements IPowerRepository {
  public items: Power[] = []

  async findByName(name: string): Promise<Power | null> {
    return this.items.find((p) => p.name === name) || null
  }

  async findById(id: string): Promise<Power | null> {
    return this.items.find((p) => p.id.toString() === id) || null
  }

  async findAll(search: string, page: number, limit: number): Promise<Power[]> {
    const start = (page - 1) * limit
    const end = start + limit

    return this.items.filter((t) => t.name.includes(search)).slice(start, end)
  }

  async create(power: Power): Promise<void> {
    this.items.push(power)
  }

  async save(power: Power): Promise<void> {
    const index = this.items.findIndex((p) => p.id.equals(power.id))
    if (index >= 0) {
      this.items[index] = power
    }
  }

  async delete(power: Power): Promise<void> {
    this.items = this.items.filter((p) => !p.id.equals(power.id))
  }
}
