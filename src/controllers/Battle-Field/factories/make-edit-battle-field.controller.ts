import { PrismaBattleFieldRepository } from '../../../repositories/prisma/prisma-battle-field-repository'
import { CachedBattleFieldRepository } from '../../../repositories/redis/cached-battle-field-repository'
import { PrismaUserRepository } from '../../../repositories/prisma/prisma-user-repository'
import { EditBattleFieldUseCase } from '../../../use-cases/Battle-Field/edit-battle-field'
import { EditBattleFieldController } from '../edit-battle-field.controller'

export function makeEditBattleFieldController(): EditBattleFieldController {
  const battleFieldRepository = new CachedBattleFieldRepository(new PrismaBattleFieldRepository())
  const userRepository = new PrismaUserRepository()
  const editBattleFieldUseCase = new EditBattleFieldUseCase(
    userRepository,
    battleFieldRepository
  )

  const editBattleFieldController = new EditBattleFieldController(
    editBattleFieldUseCase
  )
  return editBattleFieldController
}
