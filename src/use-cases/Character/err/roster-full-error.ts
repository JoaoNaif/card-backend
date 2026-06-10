import type { UseCaseError } from '../../../core/error/use-case-error'

export class RosterFullError extends Error implements UseCaseError {
  constructor() {
    super(`Your character slot is full.`)
  }
}
