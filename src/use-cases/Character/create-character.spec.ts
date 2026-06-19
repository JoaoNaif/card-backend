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

const baseRequest = {
  name: 'Brave',
  description: 'A brave character',
  baseAtk: 12,
  baseDef: 10,
  baseHp: 10,
  baseSpd: 5,
  breakthroughAttempts: 0,
  level: 10,
  maxRanking: Ranking.CAOTICO,
  ranking: Ranking.DIVERGENTE,
  xp: 10,
}

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

  it('should create a character with primary power only', async () => {
    const user = makeUser({ userRole: UserRole.ADMIN })
    const power = makePower()
    await userRepository.create(user)
    await powerRepository.create(power)

    const result = await sut.execute({
      adminId: user.id.toString(),
      powerId: power.id.toString(),
      ...baseRequest,
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.character.name).toBe('Brave')
      expect(result.value.character.secondaryPowerId).toBeNull()
      expect(result.value.character.awakenedPowerId).toBeNull()
    }
  })

  it('should create a character with dual power', async () => {
    const user = makeUser({ userRole: UserRole.ADMIN })
    const primary = makePower()
    const secondary = makePower()
    await userRepository.create(user)
    await powerRepository.create(primary)
    await powerRepository.create(secondary)

    const result = await sut.execute({
      adminId: user.id.toString(),
      powerId: primary.id.toString(),
      secondaryPowerId: secondary.id.toString(),
      ...baseRequest,
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.character.secondaryPowerId).toBe(secondary.id.toString())
    }
  })

  it('should return error when secondary power is not found', async () => {
    const user = makeUser({ userRole: UserRole.ADMIN })
    const primary = makePower()
    await userRepository.create(user)
    await powerRepository.create(primary)

    const result = await sut.execute({
      adminId: user.id.toString(),
      powerId: primary.id.toString(),
      secondaryPowerId: 'non-existing-power',
      ...baseRequest,
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should return error when primary power is not found', async () => {
    const user = makeUser({ userRole: UserRole.ADMIN })
    await userRepository.create(user)

    const result = await sut.execute({
      adminId: user.id.toString(),
      powerId: 'non-existing-power',
      ...baseRequest,
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should return error when user is not an admin', async () => {
    const user = makeUser({ userRole: UserRole.USER })
    const power = makePower()
    await userRepository.create(user)
    await powerRepository.create(power)

    const result = await sut.execute({
      adminId: user.id.toString(),
      powerId: power.id.toString(),
      ...baseRequest,
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(UnauthorizedError)
  })

  it('should return error when user is not found', async () => {
    const power = makePower()
    await powerRepository.create(power)

    const result = await sut.execute({
      adminId: 'non-existing-user-id',
      powerId: power.id.toString(),
      ...baseRequest,
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
