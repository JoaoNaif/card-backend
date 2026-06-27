import { PrismaUserRepository } from '../../../repositories/prisma/prisma-user-repository'
import { RemoveUserUseCase } from '../../../use-cases/User/remove-user'
import { RemoveUserController } from '../remove-user.controller'

export function makeRemoveUserController(): RemoveUserController {
  const userRepository = new PrismaUserRepository()
  const removeUserUseCase = new RemoveUserUseCase(userRepository)
  const removeUserController = new RemoveUserController(removeUserUseCase)

  return removeUserController
}
