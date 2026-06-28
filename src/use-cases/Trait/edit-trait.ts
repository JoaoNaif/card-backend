import { left, right, type Either } from '../../core/either'
import { ResourceAlreadyExistError } from '../../core/error/err/resource-already-exist-error'
import type { IUserRepository } from '../../repositories/interface/user-repository'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'
import type { IPowerRepository } from '../../repositories/interface/power-repository'
import { UnauthorizedError } from '../../core/error/err/unauthorized-error'
import type { ITraitRepository } from '../../repositories/interface/trait-repository'

interface EditTraitUseCaseRequest {
  adminId: string
  traitId: string
  name?: string
  description?: string
}

type EditTraitUseCaseResponse = Either<
  ResourceAlreadyExistError | ResourceNotFoundError | UnauthorizedError,
  null
>
export class EditTraitUseCase {
  constructor(
    private userRepository: IUserRepository,
    private traitRepository: ITraitRepository
  ) {}

  async execute({
    adminId,
    traitId,
    name,
    description,
  }: EditTraitUseCaseRequest): Promise<EditTraitUseCaseResponse> {
    const user = await this.userRepository.findById(adminId)

    if (!user) return left(new ResourceNotFoundError('User'))

    if (!user.isAdmin()) return left(new UnauthorizedError())

    const trait = await this.traitRepository.findById(traitId)

    if (!trait) return left(new ResourceNotFoundError('Trait'))

    if (name) {
      const newName = await this.traitRepository.findByName(name)

      if (newName) return left(new ResourceAlreadyExistError('Name'))

      trait.name = name
    }

    trait.description = description ?? trait.description

    await this.traitRepository.save(trait)

    return right(null)
  }
}
