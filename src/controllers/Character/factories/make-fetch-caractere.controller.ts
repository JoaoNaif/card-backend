import { PrismaCharacterRepository } from '../../../repositories/prisma/prisma-character-repository'
import { CachedCharacterRepository } from '../../../repositories/redis/cached-character-repository'
import { FetchCharacterUseCase } from '../../../use-cases/Character/fetch-character'
import { FetchCharacterController } from '../fetch-character.controller'

export function makeFetchCharacterController(): FetchCharacterController {
  const characterRepository = new CachedCharacterRepository(new PrismaCharacterRepository())
  const fetchCharacterUseCase = new FetchCharacterUseCase(characterRepository)
  const fetchCharacterController = new FetchCharacterController(
    fetchCharacterUseCase
  )

  return fetchCharacterController
}
