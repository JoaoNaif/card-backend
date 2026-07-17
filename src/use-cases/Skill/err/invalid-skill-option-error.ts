import type { UseCaseError } from '../../../core/error/use-case-error'

export class InvalidSkillOptionError extends Error implements UseCaseError {
  constructor() {
    super(`The chosen skill is not one of the offered options.`)
  }
}
