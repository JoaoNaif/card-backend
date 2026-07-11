import { right, type Either } from '../../core/either'
import type { ICharacterRepository } from '../../repositories/interface/character-repository'
import type { DtoCharacterList } from './dtos/dto-character-list'

interface FetchCharacterUseCaseRequest {
  search: string
  page: number
  limit: number
}

type FetchCharacterUseCaseResponse = Either<
  null,
  {
    characters: DtoCharacterList[]
  }
>

export class FetchCharacterUseCase {
  constructor(private characterRepository: ICharacterRepository) {}

  async execute({
    limit,
    page,
    search,
  }: FetchCharacterUseCaseRequest): Promise<FetchCharacterUseCaseResponse> {
    const characters = await this.characterRepository.findAll(
      search,
      page,
      limit
    )

    return right({
      characters: characters.map((character) => ({
        id: character.id.toString(),
        name: character.name,
        description: character.description,
        level: character.level,
        ranking: character.ranking,
        maxRanking: character.maxRanking,
        breakthroughAttempts: character.breakthroughAttempts,
        xp: character.xp,
        atk: character.effectiveAtk,
        def: character.effectiveDef,
        hp: character.effectiveHp,
        spd: character.effectiveSpd,
        userId: character.userId,
        powerId: character.powerId,
        traits: character.traits,
        createdAt: character.createdAt,
      })),
    })
  }
}
