import { PrismaBattleFieldRepository } from '../../../repositories/prisma/prisma-battle-field-repository'
import { FetchBattleFieldUseCase } from '../../../use-cases/BattleField/fetch-battle-field'
import { FetchBattleFieldController } from '../fetch-battle-field.controller'

export function makeFetchBattleFieldController(): FetchBattleFieldController {
  const battleFieldRepository = new PrismaBattleFieldRepository()
  const fetchBattleFieldUseCase = new FetchBattleFieldUseCase(
    battleFieldRepository
  )
  const fetchBattleFieldController = new FetchBattleFieldController(
    fetchBattleFieldUseCase
  )

  return fetchBattleFieldController
}
