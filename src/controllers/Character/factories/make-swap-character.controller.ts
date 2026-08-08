import { PrismaCharacterRepository } from '../../../repositories/prisma/prisma-character-repository'
import { CachedCharacterRepository } from '../../../repositories/redis/cached-character-repository'
import { PrismaUserRepository } from '../../../repositories/prisma/prisma-user-repository'
import { SwapCharacterUseCase } from '../../../use-cases/Character/swap-character'
import { SwapCharacterController } from '../swap-character.controller'

export function makeSwapCharacterController(): SwapCharacterController {
  const characterRepository = new CachedCharacterRepository(new PrismaCharacterRepository())
  const userRepository = new PrismaUserRepository()
  const swapCharacterUseCase = new SwapCharacterUseCase(
    characterRepository,
    userRepository
  )

  const swapCharacterController = new SwapCharacterController(
    swapCharacterUseCase
  )
  return swapCharacterController
}
