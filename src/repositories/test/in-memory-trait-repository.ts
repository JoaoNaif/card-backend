import type { Trait } from '../../entities/trait'
import type { ITraitRepository } from '../interface/trait-repository'

export class InMemoryTraitRepository implements ITraitRepository {
  public items: Trait[] = []

  async create(trait: Trait): Promise<void> {
    this.items.push(trait)
  }

  async save(trait: Trait): Promise<void> {
    const index = this.items.findIndex((t) => t.id.equals(trait.id))
    if (index >= 0) {
      this.items[index] = trait
    }
  }

  async delete(trait: Trait): Promise<void> {
    this.items = this.items.filter((t) => !t.id.equals(trait.id))
  }

  async findById(id: string): Promise<Trait | null> {
    return this.items.find((t) => t.id.toString() === id) || null
  }

  async findByName(name: string): Promise<Trait | null> {
    return this.items.find((t) => t.name === name) || null
  }

  async findAll(search: string, page: number, limit: number): Promise<Trait[]> {
    const start = (page - 1) * limit
    const end = start + limit

    return this.items.filter((t) => t.name.includes(search)).slice(start, end)
  }
}
