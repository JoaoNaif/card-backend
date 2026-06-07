import { right, type Either } from '../../core/either'
import type { ICharacterRepository } from '../../repositories/interface/character-repository'
import type { DtoCharacterRaw } from './dto/dto-character-raw'

interface FetchCharacterUseCaseRequest {
  search: string
  page: number
  limit: number
}

type FetchCharacterUseCaseResponse = Either<
  null,
  {
    characters: DtoCharacterRaw[]
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
        baseAtk: character.baseAtk,
        baseDef: character.baseDef,
        baseHp: character.baseHp,
        baseSpd: character.baseSpd,
        userId: character.userId,
        powerId: character.powerId,
        createdAt: character.createdAt,
      })),
    })
  }
}
