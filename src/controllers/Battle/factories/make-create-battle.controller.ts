import { PrismaBattleFieldRepository } from '../../../repositories/prisma/prisma-battle-field-repository'
import { CachedBattleFieldRepository } from '../../../repositories/redis/cached-battle-field-repository'
import { PrismaBattleRepository } from '../../../repositories/prisma/prisma-battle-repository'
import { CreateBattleUseCase } from '../../../use-cases/Battle/create-battle'
import { CreateBattleController } from '../create-battle.controller'

export function makeCreateBattleController(): CreateBattleController {
  const battleRepository = new PrismaBattleRepository()
  const battleFieldRepository = new CachedBattleFieldRepository(new PrismaBattleFieldRepository())
  const createBattleUseCase = new CreateBattleUseCase(
    battleRepository,
    battleFieldRepository
  )

  const createBattleController = new CreateBattleController(createBattleUseCase)

  return createBattleController
}
