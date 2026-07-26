import type { UseCaseError } from '../../../core/error/use-case-error'

export class TeamFullError extends Error implements UseCaseError {
  constructor() {
    super('Your team is full.')
  }
}
