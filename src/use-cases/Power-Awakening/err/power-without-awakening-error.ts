import type { UseCaseError } from '../../../core/error/use-case-error'

export class PowerWithoutAwakeningError extends Error implements UseCaseError {
  constructor() {
    super(`Power doesn't have an awakening.`)
  }
}
