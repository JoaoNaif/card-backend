import { PrismaUserRepository } from '../../../repositories/prisma/prisma-user-repository'
import { BcryptHasher } from '../../../repositories/cryptography/bcrypt-hasher'
import { CreateUserUseCase } from '../../../use-cases/User/create-user'
import { CreateUserController } from '../create-user.controller'

export function makeCreateUserController(): CreateUserController {
  const userRepository = new PrismaUserRepository()
  const hashGenerator = new BcryptHasher()
  const createUserUseCase = new CreateUserUseCase(userRepository, hashGenerator)
  const createUserController = new CreateUserController(createUserUseCase)

  return createUserController
}
