import { left, right, type Either } from '../../core/either'
import type { IUserRepository } from '../../repositories/interface/user-repository'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'
import { UnauthorizedError } from '../../core/error/err/unauthorized-error'
import type { ICharacterRepository } from '../../repositories/interface/character-repository'

interface RemoveCharacterUseCaseRequest {
  characterId: string
  adminId: string
}

type RemoveCharacterUseCaseResponse = Either<
  ResourceNotFoundError | UnauthorizedError,
  null
>
export class RemoveCharacterUseCase {
  constructor(
    private userRepository: IUserRepository,
    private characterRepository: ICharacterRepository
  ) {}

  async execute({
    adminId,
    characterId,
  }: RemoveCharacterUseCaseRequest): Promise<RemoveCharacterUseCaseResponse> {
    const user = await this.userRepository.findById(adminId)

    if (!user) return left(new ResourceNotFoundError('Email'))

    if (!user.isAdmin()) return left(new UnauthorizedError())

    const character = await this.characterRepository.findById(characterId)

    if (!character) return left(new ResourceNotFoundError('Character'))

    await this.characterRepository.delete(character)

    return right(null)
  }
}
