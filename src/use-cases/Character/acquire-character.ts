import { left, right, type Either } from '../../core/either'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'
import type { ICharacterRepository } from '../../repositories/interface/character-repository'
import type { IUserRepository } from '../../repositories/interface/user-repository'

interface AcquireCharacterUseCaseRequest {
  userId: string
  characterId: string
}

type AcquireCharacterUseCaseResponse = Either<ResourceNotFoundError, null>

export class AcquireCharacterUseCase {
  constructor(
    private characterRepository: ICharacterRepository,
    private userRepository: IUserRepository
  ) {}

  async execute({
    characterId,
    userId,
  }: AcquireCharacterUseCaseRequest): Promise<AcquireCharacterUseCaseResponse> {
    const user = await this.userRepository.findById(userId)

    if (!user) {
      return left(new ResourceNotFoundError('User'))
    }

    const character = await this.characterRepository.findById(characterId)

    if (!character) {
      return left(new ResourceNotFoundError('Character'))
    }

    character.userId = user.id.toString()

    await this.characterRepository.save(character)

    return right(null)
  }
}
