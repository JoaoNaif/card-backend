import { faker } from '@faker-js/faker'
import { UniqueEntityId } from '../../../core/entities/unique-entity-id'
import {
  PendingSkillChoice,
  type PendingSkillChoiceProps,
} from '../../../entities/pending-skill-choice'

export function makePendingSkillChoice(
  override: Partial<PendingSkillChoiceProps> = {},
  id?: UniqueEntityId
) {
  const pendingSkillChoice = PendingSkillChoice.create(
    {
      characterId: faker.string.uuid(),
      optionSkillIds: [
        faker.string.uuid(),
        faker.string.uuid(),
        faker.string.uuid(),
      ],
      ...override,
    },
    id
  )
  return pendingSkillChoice
}
