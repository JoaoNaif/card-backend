import type { Character } from '../../entities/character'
import type { ICharacterRepository } from '../interface/character-repository'

export class InMemoryCharacterRepository implements ICharacterRepository {
  public items: Character[] = []

  async create(character: Character): Promise<void> {
    this.items.push(character)
  }

  async save(character: Character): Promise<void> {
    const index = this.items.findIndex((u) => u.id.equals(character.id))
    if (index >= 0) {
      this.items[index] = character
    }
  }

  async delete(character: Character): Promise<void> {
    this.items = this.items.filter((u) => !u.id.equals(character.id))
  }

  async findById(id: string): Promise<Character | null> {
    return this.items.find((u) => u.id.toString() === id) ?? null
  }

  async findByName(name: string): Promise<Character | null> {
    return this.items.find((t) => t.name === name) || null
  }

  async findAll(search = '', page = 1, limit = 10): Promise<Character[]> {
    const start = (page - 1) * limit
    const end = start + limit

    return this.items.filter((t) => t.name.includes(search)).slice(start, end)
  }

  async countByUserId(userId: string): Promise<number> {
    return this.items.filter((t) => t.userId === userId).length
  }

  async findManyByUserId(userId: string): Promise<Character[]> {
    return this.items.filter((c) => c.userId === userId)
  }
}
