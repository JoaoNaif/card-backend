import { describe, it, expect, beforeEach } from 'vitest'
import { InMemoryUserRepository } from '../../repositories/test/in-memory-user-repository'
import { makeUser } from '../../repositories/test/factories/make-user'
import { UserRole } from '../../entities/user'
import { UnauthorizedError } from '../../core/error/err/unauthorized-error'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'
import { CreateSkillUseCase } from './create-skill'
import { InMemorySkillRepository } from '../../repositories/test/in-memory-skill-repository'
import { makePower } from '../../repositories/test/factories/make-power'
import { InMemoryPowerRepository } from '../../repositories/test/in-memory-power-repository'

let userRepository: InMemoryUserRepository
let skillRepository: InMemorySkillRepository
let powerRepository: InMemoryPowerRepository
let sut: CreateSkillUseCase

describe('CreateSkillUseCase', () => {
  beforeEach(() => {
    userRepository = new InMemoryUserRepository()
    skillRepository = new InMemorySkillRepository()
    powerRepository = new InMemoryPowerRepository()
    sut = new CreateSkillUseCase(
      skillRepository,
      userRepository,
      powerRepository
    )
  })

  it('should create a skill successfully', async () => {
    const user = makeUser({ userRole: UserRole.ADMIN })

    await userRepository.create(user)

    const power = makePower()

    await powerRepository.create(power)

    const result = await sut.execute({
      userId: user.id.toString(),
      name: 'Brave',
      description: 'A brave trait',
      cost: 1,
      limitation: 'limit',
      minLevel: 20,
      powerId: power.id.toString(),
    })

    expect(result.isRight()).toBe(true)
    expect(userRepository.items).toHaveLength(1)

    if (result.isRight()) {
      expect(result.value.skill.name).toBe('Brave')
      expect(result.value.skill.description).toBe('A brave trait')
    }
  })

  it('should return an error when power not found', async () => {
    const user = makeUser({ userRole: UserRole.ADMIN })

    await userRepository.create(user)

    const result = await sut.execute({
      userId: user.id.toString(),
      name: 'Brave',
      description: 'A brave trait',
      cost: 1,
      limitation: 'limit',
      minLevel: 20,
      powerId: 'non-power',
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
      userId: user.id.toString(),
      name: 'Brave',
      description: 'A brave trait',
      cost: 1,
      limitation: 'limit',
      minLevel: 20,
      powerId: power.id.toString(),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(UnauthorizedError)
  })

  it('should return an error when user is not found', async () => {
    const power = makePower()

    await powerRepository.create(power)

    const result = await sut.execute({
      userId: 'non-existing-user-id',
      name: 'Brave',
      description: 'A brave trait',
      cost: 1,
      limitation: 'limit',
      minLevel: 20,
      powerId: power.id.toString(),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
