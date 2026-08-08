import { PrismaBattleRepository } from '../../../repositories/prisma/prisma-battle-repository'
import { PrismaBattleTeamRepository } from '../../../repositories/prisma/prisma-battle-team-repository'
import { PrismaCharacterRepository } from '../../../repositories/prisma/prisma-character-repository'
import { CachedCharacterRepository } from '../../../repositories/redis/cached-character-repository'
import { PrismaUserRepository } from '../../../repositories/prisma/prisma-user-repository'
import { GetUserUseCase } from '../../../use-cases/User/get-user'
import { GetUserController } from '../get-user.controller'

export function makeGetUserController(): GetUserController {
  const userRepository = new PrismaUserRepository()
  const characterRepository = new CachedCharacterRepository(new PrismaCharacterRepository())
  const battleTeamRepository = new PrismaBattleTeamRepository()
  const battleRepository = new PrismaBattleRepository()
  const getUserUseCase = new GetUserUseCase(
    userRepository,
    characterRepository,
    battleTeamRepository,
    battleRepository
  )

  return new GetUserController(getUserUseCase)
}
