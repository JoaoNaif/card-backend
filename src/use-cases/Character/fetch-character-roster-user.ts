import { left, right, type Either } from '../../core/either'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'
import type { ICharacterRepository } from '../../repositories/interface/character-repository'
import type { IUserRepository } from '../../repositories/interface/user-repository'
import type { DtoCharacterRaw } from './dtos/dto-character-raw'

interface FetchCharacterRosterUserUseCaseRequest {
  userId: string
}

type FetchCharacterRosterUserUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    characters: DtoCharacterRaw[]
  }
>

export class FetchCharacterRosterUserUseCase {
  constructor(
    private characterRepository: ICharacterRepository,
    private userRepository: IUserRepository
  ) {}

  async execute({
    userId,
  }: FetchCharacterRosterUserUseCaseRequest): Promise<FetchCharacterRosterUserUseCaseResponse> {
    const user = await this.userRepository.findById(userId)

    if (!user) {
      return left(new ResourceNotFoundError('User'))
    }

    const characters = await this.characterRepository.findManyByUserId(userId)

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
        traits: character.traits,
        createdAt: character.createdAt,
      })),
    })
  }
}
