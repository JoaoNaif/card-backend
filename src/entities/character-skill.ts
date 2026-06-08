import { Entity } from '../core/entities/entity'
import type { UniqueEntityId } from '../core/entities/unique-entity-id'
import type { Optional } from '../core/type/optional'

export interface CharacterSkillProps {
  characterId: string
  skillId: string
  assignedAt: Date
}

export class CharacterSkill extends Entity<CharacterSkillProps> {
  get characterId() {
    return this.props.characterId
  }

  get skillId() {
    return this.props.skillId
  }

  get assignedAt() {
    return this.props.assignedAt
  }

  static create(
    props: Optional<CharacterSkillProps, 'assignedAt'>,
    id?: UniqueEntityId
  ) {
    const characterSkill = new CharacterSkill(
      {
        ...props,
        assignedAt: props.assignedAt ?? new Date(),
      },
      id
    )

    return characterSkill
  }
}
