import type { Skill } from '../../entities/skill'
import type { ISkillRepository } from '../interface/skill-repository'

export class InMemorySkillRepository implements ISkillRepository {
  public items: Skill[] = []

  async create(skill: Skill): Promise<void> {
    this.items.push(skill)
  }

  async save(skill: Skill): Promise<void> {
    const index = this.items.findIndex((u) => u.id.equals(skill.id))
    if (index >= 0) {
      this.items[index] = skill
    }
  }

  async delete(skill: Skill): Promise<void> {
    this.items = this.items.filter((u) => !u.id.equals(skill.id))
  }

  async findById(id: string): Promise<Skill | null> {
    return this.items.find((u) => u.id.toString() === id) ?? null
  }

  async findByName(name: string): Promise<Skill | null> {
    return this.items.find((t) => t.name === name) || null
  }

  async findAll(search: string, page: number, limit: number): Promise<Skill[]> {
    const start = (page - 1) * limit
    const end = start + limit

    return this.items.filter((t) => t.name.includes(search)).slice(start, end)
  }
}
