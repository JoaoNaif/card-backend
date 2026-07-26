import type { UseCaseError } from '../../../core/error/use-case-error'

export class TeamSlotOccupiedError extends Error implements UseCaseError {
  constructor() {
    super('This slot is already occupied.')
  }
}
