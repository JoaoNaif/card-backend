import { left, right, type Either } from '../../core/either'
import { ResourceAlreadyExistError } from '../../core/error/err/resource-already-exist-error'
import { User } from '../../entities/user'
import type { IUserRepository } from '../../repositories/interface/user-repository'
import type { HashGenerator } from '../../repositories/cryptography/core/hash-generator'
import type { DtoUserRaw } from './dtos/dto-user-raw'

interface CreateUserUseCaseRequest {
  name: string
  email: string
  password: string
}

type CreateUserUseCaseResponse = Either<
  ResourceAlreadyExistError,
  {
    user: DtoUserRaw
  }
>
export class CreateUserUseCase {
  constructor(
    private userRepository: IUserRepository,
    private hashGenerator: HashGenerator
  ) {}

  async execute({
    name,
    email,
    password,
  }: CreateUserUseCaseRequest): Promise<CreateUserUseCaseResponse> {
    const userAlreadyExists = await this.userRepository.findByEmail(email)

    if (userAlreadyExists) {
      return left(new ResourceAlreadyExistError('User'))
    }

    const passwordHash = await this.hashGenerator.hash(password)

    const user = User.create({
      name,
      email,
      passwordHash,
    })

    await this.userRepository.create(user)

    return right({
      user: {
        id: user.id.toString(),
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    })
  }
}
