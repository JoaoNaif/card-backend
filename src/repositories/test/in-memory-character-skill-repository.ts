import type { CharacterSkill } from '../../entities/character-skill'
import type { ICharacterSkillRepository } from '../interface/character-skill-repository'

export class InMemoryCharacterSkillRepository implements ICharacterSkillRepository {
  public items: CharacterSkill[] = []

  async create(characterSkill: CharacterSkill): Promise<void> {
    this.items.push(characterSkill)
  }

  async delete(characterSkill: CharacterSkill): Promise<void> {
    this.items = this.items.filter((u) => !u.id.equals(characterSkill.id))
  }

  async findByIds(
    characterId: string,
    skillId: string
  ): Promise<CharacterSkill | null> {
    return (
      this.items.find(
        (cs) => cs.characterId === characterId && cs.skillId === skillId
      ) ?? null
    )
  }

  async findAllByCharacterId(characterId: string): Promise<CharacterSkill[]> {
    return this.items.filter((cs) => cs.characterId === characterId)
  }
}
