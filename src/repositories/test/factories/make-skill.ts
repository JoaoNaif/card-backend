import { faker } from '@faker-js/faker'
import { UniqueEntityId } from '../../../core/entities/unique-entity-id'
import { Skill, type SkillProps } from '../../../entities/skill'

export function makeSkill(
  override: Partial<SkillProps> = {},
  id?: UniqueEntityId
) {
  const skill = Skill.create(
    {
      name: faker.person.fullName(),
      description: faker.lorem.paragraph(),
      cost: 3,
      limitation: faker.lorem.text(),
      minLevel: 10,
      powerId: faker.string.uuid(),
      ...override,
    },
    id
  )
  return skill
}
