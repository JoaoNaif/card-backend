import { Entity } from '../core/entities/entity'
import type { UniqueEntityId } from '../core/entities/unique-entity-id'
import type { Optional } from '../core/type/optional'

export interface PendingSkillChoiceProps {
  characterId: string
  optionSkillIds: string[]
  chosenSkillId?: string | null
  createdAt: Date
  resolvedAt?: Date | null
}

export class PendingSkillChoice extends Entity<PendingSkillChoiceProps> {
  get characterId() {
    return this.props.characterId
  }

  get optionSkillIds() {
    return this.props.optionSkillIds
  }

  get chosenSkillId() {
    return this.props.chosenSkillId
  }

  set chosenSkillId(skillId: string | null | undefined) {
    this.props.chosenSkillId = skillId
  }

  get createdAt() {
    return this.props.createdAt
  }

  get resolvedAt() {
    return this.props.resolvedAt
  }

  set resolvedAt(date: Date | null | undefined) {
    this.props.resolvedAt = date
  }

  static create(
    props: Optional<
      PendingSkillChoiceProps,
      'createdAt' | 'chosenSkillId' | 'resolvedAt'
    >,
    id?: UniqueEntityId
  ) {
    const pendingSkillChoice = new PendingSkillChoice(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
        chosenSkillId: props.chosenSkillId ?? null,
        resolvedAt: props.resolvedAt ?? null,
      },
      id
    )

    return pendingSkillChoice
  }
}
