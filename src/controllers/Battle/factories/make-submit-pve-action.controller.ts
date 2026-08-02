import { PrismaBattleFieldRepository } from '../../../repositories/prisma/prisma-battle-field-repository'
import { PrismaBattleRepository } from '../../../repositories/prisma/prisma-battle-repository'
import { PrismaBattleTeamRepository } from '../../../repositories/prisma/prisma-battle-team-repository'
import { SubmitPveActionUseCase } from '../../../use-cases/Battle/submit-pve-action'
import { SubmitPveActionController } from '../submit-pve-action.controller'

export function makeSubmitPveActionController(): SubmitPveActionController {
  const battleRepository = new PrismaBattleRepository()
  const battleTeamRepository = new PrismaBattleTeamRepository()
  const battleFieldRepository = new PrismaBattleFieldRepository()

  const useCase = new SubmitPveActionUseCase(
    battleRepository,
    battleTeamRepository,
    battleFieldRepository
  )

  return new SubmitPveActionController(useCase)
}
