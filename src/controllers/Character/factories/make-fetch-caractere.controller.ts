import { PrismaCharacterRepository } from '../../../repositories/prisma/prisma-character-repository'
import { PrismaPowerRepository } from '../../../repositories/prisma/prisma-power-repository'
import { PrismaUserRepository } from '../../../repositories/prisma/prisma-user-repository'
import { FetchCharacterUseCase } from '../../../use-cases/Character/fetch-character'
import { FetchCharacterController } from '../fetch-character.controller'

export function makeFetchCharacterController(): FetchCharacterController {
  const characterRepository = new PrismaCharacterRepository()
  const powerRepository = new PrismaPowerRepository()
  const userRepository = new PrismaUserRepository()
  const fetchCharacterUseCase = new FetchCharacterUseCase(
    characterRepository,
    powerRepository,
    userRepository
  )
  const fetchCharacterController = new FetchCharacterController(
    fetchCharacterUseCase
  )

  return fetchCharacterController
}
