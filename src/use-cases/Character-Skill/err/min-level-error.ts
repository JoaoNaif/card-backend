import type { UseCaseError } from '../../../core/error/use-case-error'

export class MinLevelError extends Error implements UseCaseError {
  constructor() {
    super(`There is no minimum level required for this skill.`)
  }
}
