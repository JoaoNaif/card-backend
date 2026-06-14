import { faker } from '@faker-js/faker'
import { UniqueEntityId } from '../../../core/entities/unique-entity-id'
import { Skill, StatType, type SkillProps } from '../../../entities/skill'

export function makeSkill(
  override: Partial<SkillProps> = {},
  id?: UniqueEntityId
) {
  const skill = Skill.create(
    {
      name: faker.person.fullName(),
      description: faker.lorem.paragraph(),
      limitation: faker.lorem.text(),
      cooldownTurns: 0,
      debuffStat: StatType.HP,
      debuffValue: 10,
      debuffDuration: 2,
      appliesBattleFieldId: null,
      fieldDuration: null,
      minLevel: 10,
      powerId: faker.string.uuid(),
      ...override,
    },
    id
  )
  return skill
}
