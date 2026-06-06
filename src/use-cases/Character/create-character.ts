import { left, right, type Either } from '../../core/either'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'
import { ResourceAlreadyExistError } from '../../core/error/err/resource-already-exist-error'
import { UnauthorizedError } from '../../core/error/err/unauthorized-error'
import { Character, Ranking } from '../../entities/character'
import type { IPowerRepository } from '../../repositories/interface/power-repository'
import type { ICharacterRepository } from '../../repositories/interface/character-repository'
import type { IUserRepository } from '../../repositories/interface/user-repository'
import type { DtoCharacterRaw } from './dto/dto-character-raw'

interface CreateCharacterUseCaseRequest {
  adminId: string
  name: string
  description: string
  ranking: Ranking
  maxRanking: Ranking
  level: number
  xp: number
  breakthroughAttempts: number
  baseHp: number
  baseAtk: number
  baseDef: number
  baseSpd: number
  powerId: string
}

type CreateCharacterUseCaseResponse = Either<
  ResourceAlreadyExistError | ResourceNotFoundError | UnauthorizedError,
  {
    character: DtoCharacterRaw
  }
>

export class CreateCharacterUseCase {
  constructor(
    private characterRepository: ICharacterRepository,
    private userRepository: IUserRepository,
    private powerRepository: IPowerRepository
  ) {}

  async execute({
    adminId,
    name,
    description,
    baseAtk,
    baseDef,
    baseHp,
    baseSpd,
    breakthroughAttempts,
    level,
    maxRanking,
    ranking,
    xp,
    powerId,
  }: CreateCharacterUseCaseRequest): Promise<CreateCharacterUseCaseResponse> {
    const user = await this.userRepository.findById(adminId)

    if (!user) {
      return left(new ResourceNotFoundError('User'))
    }

    if (!user.isAdmin()) {
      return left(new UnauthorizedError())
    }

    const characterAlreadyExists =
      await this.characterRepository.findByName(name)

    if (characterAlreadyExists) {
      return left(new ResourceAlreadyExistError('Character'))
    }

    const power = await this.powerRepository.findById(powerId)

    if (!power) {
      return left(new ResourceNotFoundError('Power'))
    }

    const character = Character.create({
      name,
      description,
      baseAtk,
      baseDef,
      baseHp,
      baseSpd,
      breakthroughAttempts,
      level,
      maxRanking,
      ranking,
      xp,
      powerId: power.id.toString(),
    })

    await this.characterRepository.create(character)

    return right({
      character: {
        id: character.id.toString(),
        name: character.name,
        description: character.description,
        baseAtk: character.baseAtk,
        baseDef: character.baseDef,
        baseHp: character.baseHp,
        baseSpd: character.baseSpd,
        breakthroughAttempts: character.breakthroughAttempts,
        level: character.level,
        maxRanking: character.maxRanking,
        ranking: character.ranking,
        xp: character.xp,
        userId: character.userId,
        powerId: character.powerId,
        createdAt: character.createdAt,
      },
    })
  }
}
