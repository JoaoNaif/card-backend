import type { UseCaseError } from '../../../core/error/use-case-error'

export class CharacterIncompatibleUser extends Error implements UseCaseError {
  constructor() {
    super(`Character incompatible with user..`)
  }
}
