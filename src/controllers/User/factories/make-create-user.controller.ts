import { PrismaUserRepository } from '../../../repositories/prisma/prisma-user-repository'
import { BcryptHasher } from '../../../repositories/cryptography/bcrypt-hasher'
import { JwtEncrypter } from '../../../repositories/cryptography/jwt-encrypter'
import { CreateUserUseCase } from '../../../use-cases/User/create-user'
import { CreateUserController } from '../create-user.controller'

export function makeCreateUserController(): CreateUserController {
  const userRepository = new PrismaUserRepository()
  const hashGenerator = new BcryptHasher()
  const encrypter = new JwtEncrypter()
  const createUserUseCase = new CreateUserUseCase(userRepository, hashGenerator, encrypter)
  const createUserController = new CreateUserController(createUserUseCase)

  return createUserController
}
