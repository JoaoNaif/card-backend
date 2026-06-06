import { PrismaCharacterRepository } from '../../../repositories/prisma/prisma-character-repository'
import { PrismaPowerRepository } from '../../../repositories/prisma/prisma-power-repository'
import { PrismaUserRepository } from '../../../repositories/prisma/prisma-user-repository'
import { CreateCharacterUseCase } from '../../../use-cases/Character/create-character'
import { CreateCharacterController } from '../create-character.controller'

export function makeCreateCharacterController(): CreateCharacterController {
  const characterRepository = new PrismaCharacterRepository()
  const userRepository = new PrismaUserRepository()
  const powerRepository = new PrismaPowerRepository()
  const createCharacterUseCase = new CreateCharacterUseCase(
    characterRepository,
    userRepository,
    powerRepository
  )
  const createCharacterController = new CreateCharacterController(
    createCharacterUseCase
  )
  return createCharacterController
}
