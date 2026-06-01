import { faker } from '@faker-js/faker'
import { UniqueEntityId } from '../../../core/entities/unique-entity-id'
import { User, type UserProps } from '../../../entities/user'

export function makeUser(
  override: Partial<UserProps> = {},
  id?: UniqueEntityId
) {
  const user = User.create(
    {
      email: faker.internet.email(),
      name: faker.person.fullName(),
      passwordHash: faker.internet.password(),
      ...override,
    },
    id
  )

  return user
}
