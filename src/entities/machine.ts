import { Entity } from '../core/entities/entity'
import type { UniqueEntityId } from '../core/entities/unique-entity-id'
import type { Optional } from '../core/type/optional'

export enum AiDifficulty {
  INICIANTE = 'INICIANTE',
  INTERMEDIARIO = 'INTERMEDIARIO',
  AVANCADO = 'AVANCADO',
  ESPECIALISTA = 'ESPECIALISTA',
}

export enum AiPersonality {
  EQUILIBRADO = 'EQUILIBRADO',
  MODERADO = 'MODERADO',
  OUSADO = 'OUSADO',
}

export interface MachineProps {
  label: string
  name: string
  difficulty: AiDifficulty
  personality: AiPersonality
  createdAt: Date
}

export class Machine extends Entity<MachineProps> {
  get label() {
    return this.props.label
  }

  get name() {
    return this.props.name
  }

  get difficulty() {
    return this.props.difficulty
  }

  get personality() {
    return this.props.personality
  }

  get createdAt() {
    return this.props.createdAt
  }

  static create(
    props: Optional<MachineProps, 'createdAt' | 'difficulty' | 'personality'>,
    id?: UniqueEntityId
  ) {
    return new Machine(
      {
        ...props,
        difficulty: props.difficulty ?? AiDifficulty.INICIANTE,
        personality: props.personality ?? AiPersonality.EQUILIBRADO,
        createdAt: props.createdAt ?? new Date(),
      },
      id
    )
  }
}
