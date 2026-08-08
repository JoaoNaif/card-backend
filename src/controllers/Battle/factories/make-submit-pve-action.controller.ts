import { PrismaBattleFieldRepository } from '../../../repositories/prisma/prisma-battle-field-repository'
import { CachedBattleFieldRepository } from '../../../repositories/redis/cached-battle-field-repository'
import { PrismaBattleRepository } from '../../../repositories/prisma/prisma-battle-repository'
import { PrismaBattleTeamRepository } from '../../../repositories/prisma/prisma-battle-team-repository'
import { RedisPveSessionRepository } from '../../../repositories/redis/redis-pve-session-repository'
import { SubmitPveActionUseCase } from '../../../use-cases/Battle/submit-pve-action'
import { SubmitPveActionController } from '../submit-pve-action.controller'

export function makeSubmitPveActionController(): SubmitPveActionController {
  const battleRepository = new PrismaBattleRepository()
  const battleTeamRepository = new PrismaBattleTeamRepository()
  const battleFieldRepository = new CachedBattleFieldRepository(new PrismaBattleFieldRepository())
  const pveSessionRepository = new RedisPveSessionRepository()

  const useCase = new SubmitPveActionUseCase(
    battleRepository,
    battleTeamRepository,
    battleFieldRepository,
    pveSessionRepository
  )

  return new SubmitPveActionController(useCase)
}
