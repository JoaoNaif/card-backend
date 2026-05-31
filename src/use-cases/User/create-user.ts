import { left, right, type Either } from '../../core/either'
import { ResourceAlreadyExistError } from '../../core/error/err/resource-already-exist-error'
import { User } from '../../entities/user'
import type { IUserRepository } from '../../repositories/interface/user-repository'
import type { DtoUserRaw } from './dtos/dto-user-raw'

interface CreateUserUseCaseRequest {
  name: string
  email: string
}

type CreateUserUseCaseResponse = Either<
  ResourceAlreadyExistError,
  {
    user: DtoUserRaw
  }
>
export class CreateUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute({
    name,
    email,
  }: CreateUserUseCaseRequest): Promise<CreateUserUseCaseResponse> {
    const userAlreadyExists = await this.userRepository.findByEmail(email)

    if (userAlreadyExists) {
      return left(new ResourceAlreadyExistError('User'))
    }

    const user = User.create({
      name,
      email,
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
