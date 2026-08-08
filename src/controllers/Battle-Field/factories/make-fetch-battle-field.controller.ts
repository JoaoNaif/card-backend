import { PrismaBattleFieldRepository } from '../../../repositories/prisma/prisma-battle-field-repository'
import { CachedBattleFieldRepository } from '../../../repositories/redis/cached-battle-field-repository'
import { FetchBattleFieldUseCase } from '../../../use-cases/Battle-Field/fetch-battle-field'
import { FetchBattleFieldController } from '../fetch-battle-field.controller'

export function makeFetchBattleFieldController(): FetchBattleFieldController {
  const battleFieldRepository = new CachedBattleFieldRepository(new PrismaBattleFieldRepository())
  const fetchBattleFieldUseCase = new FetchBattleFieldUseCase(
    battleFieldRepository
  )
  const fetchBattleFieldController = new FetchBattleFieldController(
    fetchBattleFieldUseCase
  )

  return fetchBattleFieldController
}
