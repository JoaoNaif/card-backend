import { PrismaCharacterRepository } from '../../../repositories/prisma/prisma-character-repository'
import { CachedCharacterRepository } from '../../../repositories/redis/cached-character-repository'
import { PrismaPowerRepository } from '../../../repositories/prisma/prisma-power-repository'
import { CachedPowerRepository } from '../../../repositories/redis/cached-power-repository'
import { PrismaUserRepository } from '../../../repositories/prisma/prisma-user-repository'
import { FetchCharacterRosterUserUseCase } from '../../../use-cases/Character/fetch-character-roster-user'
import { FetchCharacterRosterUserController } from '../fetch-character-roster-user.controller'

export function makeFetchCharacterRosterUserController(): FetchCharacterRosterUserController {
  const characterRepository = new CachedCharacterRepository(new PrismaCharacterRepository())
  const userRepository = new PrismaUserRepository()
  const powerRepository = new CachedPowerRepository(new PrismaPowerRepository())
  const fetchCharacterRosterUserUseCase = new FetchCharacterRosterUserUseCase(
    characterRepository,
    userRepository,
    powerRepository
  )

  const fetchCharacterRosterUserController =
    new FetchCharacterRosterUserController(fetchCharacterRosterUserUseCase)
  return fetchCharacterRosterUserController
}
