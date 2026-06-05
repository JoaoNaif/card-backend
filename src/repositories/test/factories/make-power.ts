import { faker } from '@faker-js/faker'
import type { UniqueEntityId } from '../../../core/entities/unique-entity-id'
import { Power, type PowerProps } from '../../../entities/power'

export function makePower(
  override: Partial<PowerProps> = {},
  id?: UniqueEntityId
) {
  const power = Power.create(
    {
      name: faker.person.fullName(),
      description: faker.lorem.paragraph(),
      ...override,
    },
    id
  )
  return power
}
