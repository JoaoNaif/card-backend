import { left, right, type Either } from '../../core/either'
import type { IUserRepository } from '../../repositories/interface/user-repository'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'
import { UnauthorizedError } from '../../core/error/err/unauthorized-error'
import type { ITraitRepository } from '../../repositories/interface/trait-repository'

interface RemoveTraitUseCaseRequest {
  traitId: string
  adminId: string
}

type RemoveTraitUseCaseResponse = Either<
  ResourceNotFoundError | UnauthorizedError,
  null
>
export class RemoveTraitUseCase {
  constructor(
    private userRepository: IUserRepository,
    private traitRepository: ITraitRepository
  ) {}

  async execute({
    adminId,
    traitId,
  }: RemoveTraitUseCaseRequest): Promise<RemoveTraitUseCaseResponse> {
    const user = await this.userRepository.findById(adminId)

    if (!user) return left(new ResourceNotFoundError('Email'))

    if (!user.isAdmin()) return left(new UnauthorizedError())

    const trait = await this.traitRepository.findById(traitId)

    if (!trait) return left(new ResourceNotFoundError('Trait'))

    await this.traitRepository.delete(trait)

    return right(null)
  }
}
