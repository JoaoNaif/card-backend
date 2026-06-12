import { left, right, type Either } from '../../core/either'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'
import { UnauthorizedError } from '../../core/error/err/unauthorized-error'
import type { ICharacterRepository } from '../../repositories/interface/character-repository'
import type { ITraitRepository } from '../../repositories/interface/trait-repository'
import type { IUserRepository } from '../../repositories/interface/user-repository'

interface AssignTraitUseCaseRequest {
  userId: string
  characterId: string
  traitId: string
}

type AssignTraitUseCaseResponse = Either<
  ResourceNotFoundError | UnauthorizedError,
  null
>

export class AssignTraitUseCase {
  constructor(
    private characterRepository: ICharacterRepository,
    private userRepository: IUserRepository,
    private traitRepository: ITraitRepository
  ) {}

  async execute({
    characterId,
    userId,
    traitId,
  }: AssignTraitUseCaseRequest): Promise<AssignTraitUseCaseResponse> {
    const user = await this.userRepository.findById(userId)

    if (!user) {
      return left(new ResourceNotFoundError('User'))
    }

    const character = await this.characterRepository.findById(characterId)

    if (!character) {
      return left(new ResourceNotFoundError('Character'))
    }

    const trait = await this.traitRepository.findById(traitId)

    if (!trait) {
      return left(new ResourceNotFoundError('Trait'))
    }

    if (character.userId !== userId) {
      return left(new UnauthorizedError())
    }

    await this.characterRepository.assignTrait(characterId, traitId)

    return right(null)
  }
}
