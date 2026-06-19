import type { UseCaseError } from '../../../core/error/use-case-error'

export class SlotSkillFullError extends Error implements UseCaseError {
  constructor() {
    super(`Your skill slot is full.`)
  }
}
