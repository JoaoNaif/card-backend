import { UniqueEntityId } from '../../../core/entities/unique-entity-id'
import { PendingSkillChoice } from '../../../entities/pending-skill-choice'
import type { PendingSkillChoice as PendingSkillChoicePrisma } from '../../../generated/prisma'

export class PrismaPendingSkillChoiceMapper {
  static toDomain(raw: PendingSkillChoicePrisma): PendingSkillChoice {
    return PendingSkillChoice.create(
      {
        characterId: raw.characterId,
        optionSkillIds: raw.optionSkillIds,
        chosenSkillId: raw.chosenSkillId,
        createdAt: raw.createdAt,
        resolvedAt: raw.resolvedAt,
      },
      new UniqueEntityId(raw.id)
    )
  }

  static toPrisma(pendingSkillChoice: PendingSkillChoice) {
    return {
      id: pendingSkillChoice.id.toString(),
      characterId: pendingSkillChoice.characterId,
      optionSkillIds: pendingSkillChoice.optionSkillIds,
      chosenSkillId: pendingSkillChoice.chosenSkillId,
      createdAt: pendingSkillChoice.createdAt,
      resolvedAt: pendingSkillChoice.resolvedAt,
    }
  }
}
