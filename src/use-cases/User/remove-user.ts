import { left, right, type Either } from '../../core/either'
import { ResourceAlreadyExistError } from '../../core/error/err/resource-already-exist-error'
import type { IUserRepository } from '../../repositories/interface/user-repository'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'

interface RemoveUserUseCaseRequest {
  userId: string
}

type RemoveUserUseCaseResponse = Either<ResourceNotFoundError, null>
export class RemoveUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute({
    userId,
  }: RemoveUserUseCaseRequest): Promise<RemoveUserUseCaseResponse> {
    const user = await this.userRepository.findById(userId)

    if (!user) return left(new ResourceNotFoundError('Email'))

    await this.userRepository.delete(user)

    return right(null)
  }
}
