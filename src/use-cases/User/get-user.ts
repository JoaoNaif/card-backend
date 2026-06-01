import { left, right, type Either } from '../../core/either'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'
import type { IUserRepository } from '../../repositories/interface/user-repository'
import type { DtoUserRaw } from './dtos/dto-user-raw'

interface GetUserRequest {
  id: string
}

type GetUserResponse = Either<
  ResourceNotFoundError,
  {
    user: DtoUserRaw
  }
>

export class GetUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute({ id }: GetUserRequest): Promise<GetUserResponse> {
    const user = await this.userRepository.findById(id)

    if (!user) {
      return left(new ResourceNotFoundError('User'))
    }

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
