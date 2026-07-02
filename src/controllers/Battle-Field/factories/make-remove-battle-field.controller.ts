import { PrismaBattleFieldRepository } from '../../../repositories/prisma/prisma-battle-field-repository'
import { PrismaUserRepository } from '../../../repositories/prisma/prisma-user-repository'
import { RemoveBattleFieldUseCase } from '../../../use-cases/Battle-Field/remove-battle-field'
import { RemoveBattleFieldController } from '../remove-battle-field.controller'

export function makeRemoveBattleFieldController(): RemoveBattleFieldController {
  const battleFieldRepository = new PrismaBattleFieldRepository()
  const userRepository = new PrismaUserRepository()
  const removeBattleFieldUseCase = new RemoveBattleFieldUseCase(
    userRepository,
    battleFieldRepository
  )

  const removeBattleFieldController = new RemoveBattleFieldController(
    removeBattleFieldUseCase
  )
  return removeBattleFieldController
}
