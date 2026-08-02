import type { UseCaseError } from '../../../core/error/use-case-error'

export class InvalidBattleActionError extends Error implements UseCaseError {
  constructor(message: string) {
    super(message)
  }
}
