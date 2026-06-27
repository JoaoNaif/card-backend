import { left, right, type Either } from '../../core/either'
import { ResourceAlreadyExistError } from '../../core/error/err/resource-already-exist-error'
import type { IUserRepository } from '../../repositories/interface/user-repository'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'

interface EditUserUseCaseRequest {
  userId: string
  name?: string
  email?: string
}

type EditUserUseCaseResponse = Either<
  ResourceAlreadyExistError | ResourceNotFoundError,
  null
>
export class EditUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute({
    userId,
    name,
    email,
  }: EditUserUseCaseRequest): Promise<EditUserUseCaseResponse> {
    const user = await this.userRepository.findById(userId)

    if (!user) return left(new ResourceNotFoundError('Email'))

    if (email) {
      const newEmail = await this.userRepository.findByEmail(email)

      if (newEmail) return left(new ResourceAlreadyExistError('Email'))

      user.email = email
    }

    user.name = name ?? user.name

    await this.userRepository.save(user)

    return right(null)
  }
}
