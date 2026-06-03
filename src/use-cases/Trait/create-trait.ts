import { left, right, type Either } from '../../core/either'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'
import { ResourceAlreadyExistError } from '../../core/error/err/resource-already-exist-error'
import { UnauthorizedError } from '../../core/error/err/unauthorized-error'
import { Trait } from '../../entities/trait'
import type { ITraitRepository } from '../../repositories/interface/trait-repository'
import type { IUserRepository } from '../../repositories/interface/user-repository'
import type { DtoTraitRaw } from './dtos/dto-trait-raw'

interface CreateTraitUseCaseRequest {
  userId: string
  name: string
  description: string
}

type CreateTraitUseCaseResponse = Either<
  ResourceAlreadyExistError | ResourceNotFoundError | UnauthorizedError,
  {
    trait: DtoTraitRaw
  }
>

export class CreateTraitUseCase {
  constructor(
    private traitRepository: ITraitRepository,
    private userRepository: IUserRepository
  ) {}

  async execute({
    userId,
    name,
    description,
  }: CreateTraitUseCaseRequest): Promise<CreateTraitUseCaseResponse> {
    const user = await this.userRepository.findById(userId)

    if (!user) {
      return left(new ResourceNotFoundError('User'))
    }

    if (!user.isAdmin()) {
      return left(new UnauthorizedError())
    }

    const traitAlreadyExists = await this.traitRepository.findByName(name)

    if (traitAlreadyExists) {
      return left(new ResourceAlreadyExistError('Trait'))
    }

    const trait = Trait.create({
      name,
      description,
    })

    await this.traitRepository.create(trait)

    return right({
      trait: {
        id: trait.id.toString(),
        name: trait.name,
        description: trait.description,
        createdAt: trait.createdAt,
      },
    })
  }
}
