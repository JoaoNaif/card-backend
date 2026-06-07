import { faker } from '@faker-js/faker'
import type { UniqueEntityId } from '../../../core/entities/unique-entity-id'
import { Character, Ranking, type CharacterProps } from '../../../entities/character'

export function makeCharacter(
  override: Partial<CharacterProps> = {},
  id?: UniqueEntityId
) {
  const character = Character.create(
    {
      name: faker.person.fullName(),
      description: faker.lorem.paragraph(),
      ranking: Ranking.MORTAL,
      maxRanking: Ranking.LENDARIO,
      level: 1,
      xp: 0,
      breakthroughAttempts: 0,
      baseHp: 100,
      baseAtk: 10,
      baseDef: 10,
      baseSpd: 10,
      powerId: faker.string.uuid(),
      userId: faker.string.uuid(),
      ...override,
    },
    id
  )
  return character
}
