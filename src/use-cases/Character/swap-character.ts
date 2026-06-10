import { left, right, type Either } from '../../core/either'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'
import type { ICharacterRepository } from '../../repositories/interface/character-repository'
import type { IUserRepository } from '../../repositories/interface/user-repository'
import { CharacterIncompatibleUser } from './err/character-incompatible-user'

interface SwapCharacterUseCaseRequest {
  userId: string
  removeCharacterId: string
  newCharacterId: string
}

type SwapCharacterUseCaseResponse = Either<
  ResourceNotFoundError | CharacterIncompatibleUser,
  null
>

export class SwapCharacterUseCase {
  constructor(
    private characterRepository: ICharacterRepository,
    private userRepository: IUserRepository
  ) {}

  async execute({
    newCharacterId,
    removeCharacterId,
    userId,
  }: SwapCharacterUseCaseRequest): Promise<SwapCharacterUseCaseResponse> {
    const user = await this.userRepository.findById(userId)

    if (!user) {
      return left(new ResourceNotFoundError('User'))
    }

    const removeCharacter =
      await this.characterRepository.findById(removeCharacterId)

    if (!removeCharacter) {
      return left(new ResourceNotFoundError('Remove Character'))
    }

    if (removeCharacter.userId !== user.id.toString()) {
      return left(new CharacterIncompatibleUser())
    }

    const newCharacter = await this.characterRepository.findById(newCharacterId)

    if (!newCharacter) {
      return left(new ResourceNotFoundError('New Character'))
    }

    removeCharacter.userId = null

    await this.characterRepository.save(removeCharacter)

    newCharacter.userId = user.id.toString()

    await this.characterRepository.save(newCharacter)

    return right(null)
  }
}
