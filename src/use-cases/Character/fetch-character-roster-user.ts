import { left, right, type Either } from '../../core/either'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'
import type { ICharacterRepository } from '../../repositories/interface/character-repository'
import type { IPowerRepository } from '../../repositories/interface/power-repository'
import type { IUserRepository } from '../../repositories/interface/user-repository'
import type { DtoPowerRaw } from '../Power/dtos/dto-power-raw'
import type { DtoCharacterRoster } from './dtos/dto_character-roster'

interface FetchCharacterRosterUserUseCaseRequest {
  userId: string
}

type FetchCharacterRosterUserUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    characters: DtoCharacterRoster[]
  }
>

export class FetchCharacterRosterUserUseCase {
  constructor(
    private characterRepository: ICharacterRepository,
    private userRepository: IUserRepository,
    private powerRepository: IPowerRepository
  ) {}

  async execute({
    userId,
  }: FetchCharacterRosterUserUseCaseRequest): Promise<FetchCharacterRosterUserUseCaseResponse> {
    const user = await this.userRepository.findById(userId)

    if (!user) {
      return left(new ResourceNotFoundError('User'))
    }

    const characters = await this.characterRepository.findManyByUserId(userId)

    const roster: DtoCharacterRoster[] = []

    for (const character of characters) {
      const power = await this.powerRepository.findById(character.powerId)

      if (!power) {
        return left(new ResourceNotFoundError('Power'))
      }

      const powerDto: DtoPowerRaw = {
        id: power.id.toString(),
        name: power.name,
        description: power.description,
        pillar: power.pillar,
        canAwaken: power.canAwaken,
        isAwakened: power.isAwakened,
        createdAt: power.createdAt,
      }

      roster.push({
        id: character.id.toString(),
        name: character.name,
        description: character.description,
        level: character.level,
        ranking: character.ranking,
        xp: character.xp,
        baseAtk: character.baseAtk,
        baseDef: character.baseDef,
        baseHp: character.baseHp,
        baseSpd: character.baseSpd,
        userId: character.userId,
        power: powerDto,
        traits: character.traits,
        createdAt: character.createdAt,
      })
    }

    return right({ characters: roster })
  }
}
