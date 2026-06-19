import { left, right, type Either } from '../../core/either'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'
import { ResourceAlreadyExistError } from '../../core/error/err/resource-already-exist-error'
import { UnauthorizedError } from '../../core/error/err/unauthorized-error'
import { Character, Ranking } from '../../entities/character'
import type { IPowerRepository } from '../../repositories/interface/power-repository'
import type { ICharacterRepository } from '../../repositories/interface/character-repository'
import type { IUserRepository } from '../../repositories/interface/user-repository'
import type { DtoCharacterRaw } from './dtos/dto-character-raw'

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
  secondaryPowerId?: string | null | undefined
  awakenedPowerId?: string | null | undefined
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
    awakenedPowerId,
    secondaryPowerId,
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

    let resolvedSecondaryPowerId: string | null = null
    if (secondaryPowerId) {
      const secondPower = await this.powerRepository.findById(secondaryPowerId)
      if (!secondPower) {
        return left(new ResourceNotFoundError('Secondary Power'))
      }
      resolvedSecondaryPowerId = secondPower.id.toString()
    }

    let resolvedAwakenedPowerId: string | null = null
    if (awakenedPowerId) {
      const awakePower = await this.powerRepository.findById(awakenedPowerId)
      if (!awakePower) {
        return left(new ResourceNotFoundError('Awakened Power'))
      }
      resolvedAwakenedPowerId = awakePower.id.toString()
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
      secondaryPowerId: resolvedSecondaryPowerId,
      awakenedPowerId: resolvedAwakenedPowerId,
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
        awakenedPowerId: character.awakenedPowerId,
        secondaryPowerId: character.secondaryPowerId,
        powerId: character.powerId,
        traits: [] as { id: string; name: string }[],
        createdAt: character.createdAt,
      },
    })
  }
}
