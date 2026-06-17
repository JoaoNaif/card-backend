import { faker } from '@faker-js/faker'
import { UniqueEntityId } from '../../../core/entities/unique-entity-id'
import {
  CharacterSkill,
  type CharacterSkillProps,
} from '../../../entities/character-skill'

export function makeCharacterSkill(
  override: Partial<CharacterSkillProps> = {},
  id?: UniqueEntityId
) {
  const characterskill = CharacterSkill.create(
    {
      characterId: faker.string.uuid(),
      skillId: faker.string.uuid(),
      ...override,
    },
    id
  )
  return characterskill
}
