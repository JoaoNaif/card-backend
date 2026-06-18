import type { UseCaseError } from '../../../core/error/use-case-error'

export class SkillNotFullError extends Error implements UseCaseError {
  constructor() {
    super(`You cannot make the exchange; there are available skill fields.`)
  }
}
