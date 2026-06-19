import type { UseCaseError } from '../../../core/error/use-case-error'

export class SkillIncompatibleWithPowerError
  extends Error
  implements UseCaseError
{
  constructor() {
    super(`Skill incompatible with power.`)
  }
}
