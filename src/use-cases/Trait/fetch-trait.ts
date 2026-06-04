import { left, right, type Either } from '../../core/either'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'
import { UnauthorizedError } from '../../core/error/err/unauthorized-error'
import type { ITraitRepository } from '../../repositories/interface/trait-repository'
import type { IUserRepository } from '../../repositories/interface/user-repository'
import type { DtoTraitRaw } from './dtos/dto-trait-raw'

interface FetchTraitUseCaseRequest {
  userId: string
  search: string
  page: number
  limit: number
}

type FetchTraitUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    traits: DtoTraitRaw[]
  }
>

export class FetchTraitUseCase {
  constructor(
    private traitRepository: ITraitRepository,
    private userRepository: IUserRepository
  ) {}

  async execute({
    userId,
    search,
    page,
    limit,
  }: FetchTraitUseCaseRequest): Promise<FetchTraitUseCaseResponse> {
    const user = await this.userRepository.findById(userId)

    if (!user) {
      return left(new ResourceNotFoundError('User'))
    }

    const traits = await this.traitRepository.findAll(search, page, limit)

    return right({
      traits: traits.map((trait) => ({
        id: trait.id.toString(),
        name: trait.name,
        description: trait.description,
        createdAt: trait.createdAt,
      })),
    })
  }
}
