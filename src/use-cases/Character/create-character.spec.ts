import { describe, it, expect, beforeEach } from 'vitest'
import { InMemoryUserRepository } from '../../repositories/test/in-memory-user-repository'
import { makeUser } from '../../repositories/test/factories/make-user'
import { UserRole } from '../../entities/user'
import { UnauthorizedError } from '../../core/error/err/unauthorized-error'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'
import { makePower } from '../../repositories/test/factories/make-power'
import { InMemoryPowerRepository } from '../../repositories/test/in-memory-power-repository'
import { InMemoryCharacterRepository } from '../../repositories/test/in-memory-character-repository'
import { CreateCharacterUseCase } from './create-character'
import { Ranking } from '../../entities/character'

let userRepository: InMemoryUserRepository
let characterRepository: InMemoryCharacterRepository
let powerRepository: InMemoryPowerRepository
let sut: CreateCharacterUseCase

describe('CreateCharacterUseCase', () => {
  beforeEach(() => {
    userRepository = new InMemoryUserRepository()
    characterRepository = new InMemoryCharacterRepository()
    powerRepository = new InMemoryPowerRepository()
    sut = new CreateCharacterUseCase(
      characterRepository,
      userRepository,
      powerRepository
    )
  })

  it('should create a character successfully', async () => {
    const user = makeUser({ userRole: UserRole.ADMIN })

    await userRepository.create(user)

    const power = makePower()

    await powerRepository.create(power)

    const result = await sut.execute({
      adminId: user.id.toString(),
      name: 'Brave',
      description: 'A brave trait',
      baseAtk: 12,
      baseDef: 10,
      baseHp: 10,
      baseSpd: 5,
      breakthroughAttempts: 0,
      level: 10,
      maxRanking: Ranking.ANCESTRAL,
      ranking: Ranking.MITICO,
      xp: 10,
      powerId: power.id.toString(),
    })

    expect(result.isRight()).toBe(true)
    expect(userRepository.items).toHaveLength(1)

    if (result.isRight()) {
      expect(result.value.character.name).toBe('Brave')
      expect(result.value.character.description).toBe('A brave trait')
    }
  })

  it('should return an error when power not found', async () => {
    const user = makeUser({ userRole: UserRole.ADMIN })

    await userRepository.create(user)

    const result = await sut.execute({
      adminId: user.id.toString(),
      name: 'Brave',
      description: 'A brave trait',
      baseAtk: 12,
      baseDef: 10,
      baseHp: 10,
      baseSpd: 5,
      breakthroughAttempts: 0,
      level: 10,
      maxRanking: Ranking.ANCESTRAL,
      ranking: Ranking.MITICO,
      xp: 10,
      powerId: 'non power',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should return an error when user is not an admin', async () => {
    const user = makeUser({ userRole: UserRole.USER })

    await userRepository.create(user)

    const power = makePower()

    await powerRepository.create(power)

    const result = await sut.execute({
      adminId: user.id.toString(),
      name: 'Brave',
      description: 'A brave trait',
      baseAtk: 12,
      baseDef: 10,
      baseHp: 10,
      baseSpd: 5,
      breakthroughAttempts: 0,
      level: 10,
      maxRanking: Ranking.ANCESTRAL,
      ranking: Ranking.MITICO,
      xp: 10,
      powerId: 'non power',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(UnauthorizedError)
  })

  it('should return an error when user is not found', async () => {
    const power = makePower()

    await powerRepository.create(power)

    const result = await sut.execute({
      adminId: 'non-existing-user-id',
      name: 'Brave',
      description: 'A brave trait',
      baseAtk: 12,
      baseDef: 10,
      baseHp: 10,
      baseSpd: 5,
      breakthroughAttempts: 0,
      level: 10,
      maxRanking: Ranking.ANCESTRAL,
      ranking: Ranking.MITICO,
      xp: 10,
      powerId: 'non power',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
