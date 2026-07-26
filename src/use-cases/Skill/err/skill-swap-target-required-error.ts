import type { UseCaseError } from '../../../core/error/use-case-error'

export class SkillSwapTargetRequiredError
  extends Error
  implements UseCaseError
{
  constructor() {
    super(
      `Your skill slot is full. Inform which current skill should be replaced.`
    )
  }
}
