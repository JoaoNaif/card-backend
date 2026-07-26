import type { UseCaseError } from '../../../core/error/use-case-error'

export class InvalidTeamCompositionError extends Error implements UseCaseError {
  constructor(message: string) {
    super(message)
  }
}
