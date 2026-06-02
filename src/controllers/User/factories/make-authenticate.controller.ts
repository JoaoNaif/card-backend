import { BcryptHasher } from '../../../repositories/cryptography/bcrypt-hasher'
import { JwtEncrypter } from '../../../repositories/cryptography/jwt-encrypter'
import { PrismaUserRepository } from '../../../repositories/prisma/prisma-user-repository'
import { AuthenticateUserUseCase } from '../../../use-cases/User/authenticate-user'
import { AuthenticateUserController } from '../authenticate-user.controller'

export function makeAutenticateUserController(): AuthenticateUserController {
  const userRepository = new PrismaUserRepository()
  const hashCompare = new BcryptHasher()
  const encrypter = new JwtEncrypter()
  const authenticateUserUseCase = new AuthenticateUserUseCase(userRepository, hashCompare, encrypter)

  return new AuthenticateUserController(authenticateUserUseCase)
}
