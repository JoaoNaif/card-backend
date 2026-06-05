import { describe, it, expect, beforeEach } from 'vitest'
import { InMemoryUserRepository } from '../../repositories/test/in-memory-user-repository'
import { InMemoryTraitRepository } from '../../repositories/test/in-memory-trait-repository'
import { makeUser } from '../../repositories/test/factories/make-user'
import { UserRole } from '../../entities/user'
import { UnauthorizedError } from '../../core/error/err/unauthorized-error'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'
import { CreatePowerUseCase } from './create-power'
import { InMemoryPowerRepository } from '../../repositories/test/in-memory-power-repository'

let userRepository: InMemoryUserRepository
let powerRepository: InMemoryPowerRepository
let sut: CreatePowerUseCase

describe('CreatePowerUseCase', () => {
  beforeEach(() => {
    userRepository = new InMemoryUserRepository()
    powerRepository = new InMemoryPowerRepository()
    sut = new CreatePowerUseCase(powerRepository, userRepository)
  })

  it('should create a power successfully', async () => {
    const user = makeUser({ userRole: UserRole.ADMIN })

    await userRepository.create(user)

    const result = await sut.execute({
      userId: user.id.toString(),
      name: 'Fire',
      description: 'Fire attack',
    })

    expect(result.isRight()).toBe(true)
    expect(userRepository.items).toHaveLength(1)

    if (result.isRight()) {
      expect(result.value.power.name).toBe('Fire')
      expect(result.value.power.description).toBe('Fire attack')
    }
  })

  it('should return an error when user is not an admin', async () => {
    const user = makeUser({ userRole: UserRole.USER })

    await userRepository.create(user)

    const result = await sut.execute({
      userId: user.id.toString(),
      name: 'Brave',
      description: 'A brave trait',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(UnauthorizedError)
  })

  it('should return an error when user is not found', async () => {
    const result = await sut.execute({
      userId: 'non-existing-user-id',
      name: 'Brave',
      description: 'A brave trait',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
