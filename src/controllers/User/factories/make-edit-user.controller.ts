import { PrismaUserRepository } from '../../../repositories/prisma/prisma-user-repository'
import { EditUserUseCase } from '../../../use-cases/User/edit-user'
import { EditUserController } from '../edit-user.controller'

export function makeEditUserController(): EditUserController {
  const userRepository = new PrismaUserRepository()
  const editUserUseCase = new EditUserUseCase(userRepository)
  const editUserController = new EditUserController(editUserUseCase)

  return editUserController
}
