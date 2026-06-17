import type { Skill } from '../../entities/skill'

export interface ISkillRepository {
  create(skill: Skill): Promise<void>
  save(skill: Skill): Promise<void>
  delete(skill: Skill): Promise<void>
  findById(id: string): Promise<Skill | null>
  findByName(name: string): Promise<Skill | null>
  findAll(search: string, page: number, limit: number): Promise<Skill[]>
  findEligibleForCharacter(
    powerIds: string[],
    characterLevel: number,
    excludeSkillIds: string[]
  ): Promise<Skill[]>
}
