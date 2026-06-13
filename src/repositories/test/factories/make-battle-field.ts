import { faker } from '@faker-js/faker'
import type { UniqueEntityId } from '../../../core/entities/unique-entity-id'
import { BattleField, type BattleFieldProps } from '../../../entities/battle-field'

export function makeBattleField(
  override: Partial<BattleFieldProps> = {},
  id?: UniqueEntityId
) {
  return BattleField.create(
    {
      name: faker.location.city(),
      description: faker.lorem.paragraph(),
      modifiers: [],
      ...override,
    },
    id
  )
}
