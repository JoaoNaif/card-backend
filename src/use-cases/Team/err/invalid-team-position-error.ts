import type { UseCaseError } from '../../../core/error/use-case-error'

export class InvalidTeamPositionError extends Error implements UseCaseError {
  constructor() {
    super('Position is outside the team grid.')
  }
}
