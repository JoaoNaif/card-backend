import type { CharacterSkill } from '../../entities/character-skill'
import type { ICharacterSkillRepository } from '../interface/character-skill-repository'
import { cacheDelete } from './cache'
import { characterSkillsKey } from './character-skills-cache-key'

export class CachedCharacterSkillRepository implements ICharacterSkillRepository {
  constructor(private inner: ICharacterSkillRepository) {}

  findByIds(characterId: string, skillId: string): Promise<CharacterSkill | null> {
    return this.inner.findByIds(characterId, skillId)
  }

  findAllByCharacterId(characterId: string): Promise<CharacterSkill[]> {
    return this.inner.findAllByCharacterId(characterId)
  }

  async create(characterSkill: CharacterSkill): Promise<void> {
    await this.inner.create(characterSkill)
    await cacheDelete(characterSkillsKey(characterSkill.characterId))
  }

  async delete(characterSkill: CharacterSkill): Promise<void> {
    await this.inner.delete(characterSkill)
    await cacheDelete(characterSkillsKey(characterSkill.characterId))
  }
}
