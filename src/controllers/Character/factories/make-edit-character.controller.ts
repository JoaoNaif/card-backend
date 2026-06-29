import { PrismaCharacterRepository } from '../../../repositories/prisma/prisma-character-repository'
import { PrismaUserRepository } from '../../../repositories/prisma/prisma-user-repository'
import { EditCharacterUseCase } from '../../../use-cases/Character/edit-character'
import { EditCharacterController } from '../edit-character.controller'

export function makeEditCharacterController(): EditCharacterController {
  const characterRepository = new PrismaCharacterRepository()
  const userRepository = new PrismaUserRepository()
  const editCharacterUseCase = new EditCharacterUseCase(
    userRepository,
    characterRepository
  )
  return new EditCharacterController(editCharacterUseCase)
}
