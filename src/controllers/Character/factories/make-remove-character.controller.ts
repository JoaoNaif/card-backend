import { PrismaCharacterRepository } from '../../../repositories/prisma/prisma-character-repository'
import { CachedCharacterRepository } from '../../../repositories/redis/cached-character-repository'
import { PrismaUserRepository } from '../../../repositories/prisma/prisma-user-repository'
import { RemoveCharacterUseCase } from '../../../use-cases/Character/remove-character'
import { RemoveCharacterController } from '../remove-character.controller'

export function makeRemoveCharacterController(): RemoveCharacterController {
  const characterRepository = new CachedCharacterRepository(new PrismaCharacterRepository())
  const userRepository = new PrismaUserRepository()
  const removeCharacterUseCase = new RemoveCharacterUseCase(
    userRepository,
    characterRepository
  )

  const removeCharacterController = new RemoveCharacterController(
    removeCharacterUseCase
  )
  return removeCharacterController
}
