import { left, right, type Either } from '../../core/either'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'
import type { ICharacterRepository } from '../../repositories/interface/character-repository'
import type { IUserRepository } from '../../repositories/interface/user-repository'
import { RosterFullError } from './err/roster-full-error'

interface AcquireCharacterUseCaseRequest {
  userId: string
  characterId: string
}

type AcquireCharacterUseCaseResponse = Either<
  ResourceNotFoundError | RosterFullError,
  null
>

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

    const countCharacterByUser = await this.characterRepository.countByUserId(
      user.id.toString()
    )

    if (countCharacterByUser >= 8) {
      return left(new RosterFullError())
    }

    character.userId = user.id.toString()

    await this.characterRepository.save(character)

    return right(null)
  }
}
