import type { UseCaseError } from '../../../core/error/use-case-error'

export class PowerIsNotAwakeningError extends Error implements UseCaseError {
  constructor() {
    super(`Power is not awakening.`)
  }
}
