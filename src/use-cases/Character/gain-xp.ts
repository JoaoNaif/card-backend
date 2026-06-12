import { left, right, type Either } from '../../core/either'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'
import type { ICharacterRepository } from '../../repositories/interface/character-repository'

interface GainXpUseCaseRequest {
  characterId: string
  xpAmount: number
}

type GainXpUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    levelsGained: number
    newLevel: number
  }
>

export class GainXpUseCase {
  constructor(private characterRepository: ICharacterRepository) {}

  async execute({
    characterId,
    xpAmount,
  }: GainXpUseCaseRequest): Promise<GainXpUseCaseResponse> {
    const character = await this.characterRepository.findById(characterId)

    if (!character) {
      return left(new ResourceNotFoundError('Character'))
    }

    const levelsGained = character.gainXp(xpAmount)

    await this.characterRepository.save(character)

    return right({ levelsGained, newLevel: character.level })
  }
}
