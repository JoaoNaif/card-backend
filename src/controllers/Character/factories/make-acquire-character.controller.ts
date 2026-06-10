import { PrismaCharacterRepository } from '../../../repositories/prisma/prisma-character-repository'
import { PrismaUserRepository } from '../../../repositories/prisma/prisma-user-repository'
import { AcquireCharacterUseCase } from '../../../use-cases/Character/acquire-character'
import { AcquireCharacterController } from '../acquire-character.controller'

export function makeAcquireCharacterController(): AcquireCharacterController {
  const characterRepository = new PrismaCharacterRepository()
  const userRepository = new PrismaUserRepository()
  const acquireCharacterUseCase = new AcquireCharacterUseCase(
    characterRepository,
    userRepository
  )

  const acquireCharacterController = new AcquireCharacterController(
    acquireCharacterUseCase
  )
  return acquireCharacterController
}
