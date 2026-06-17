import type { UseCaseError } from '../../../core/error/use-case-error'

export class UnavailabelSkillOptionsError
  extends Error
  implements UseCaseError
{
  constructor() {
    super(`There are no skill options available.`)
  }
}
