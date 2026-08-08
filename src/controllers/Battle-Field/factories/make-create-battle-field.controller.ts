import { PrismaBattleFieldRepository } from '../../../repositories/prisma/prisma-battle-field-repository'
import { CachedBattleFieldRepository } from '../../../repositories/redis/cached-battle-field-repository'
import { PrismaTraitRepository } from '../../../repositories/prisma/prisma-trait-repository'
import { PrismaUserRepository } from '../../../repositories/prisma/prisma-user-repository'
import { CreateBattleFieldUseCase } from '../../../use-cases/Battle-Field/create-battle-field'
import { CreateBattleFieldController } from '../create-battle-field.controller'

export function makeCreateBattleFieldController(): CreateBattleFieldController {
  const traitRepository = new PrismaTraitRepository()
  const battleFieldRepository = new CachedBattleFieldRepository(new PrismaBattleFieldRepository())
  const userRepository = new PrismaUserRepository()
  const createBattleFieldUseCase = new CreateBattleFieldUseCase(
    battleFieldRepository,
    userRepository,
    traitRepository
  )

  const createBattleFieldController = new CreateBattleFieldController(
    createBattleFieldUseCase
  )
  return createBattleFieldController
}
