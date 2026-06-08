import type { CharacterSkill } from '../../entities/character-skill'

export interface ICharacterSkillRepository {
  create(characterSkill: CharacterSkill): Promise<void>
  delete(characterSkill: CharacterSkill): Promise<void>
  findByIds(
    characterId: string,
    skillId: string
  ): Promise<CharacterSkill | null>
  findAllByCharacterId(characterId: string): Promise<CharacterSkill[]>
}
