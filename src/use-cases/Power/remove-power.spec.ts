import { describe, it, expect, beforeEach } from 'vitest'
import { InMemoryUserRepository } from '../../repositories/test/in-memory-user-repository'
import { makeUser } from '../../repositories/test/factories/make-user'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'
import { RemovePowerUseCase } from './remove-power'
import { InMemoryPowerRepository } from '../../repositories/test/in-memory-power-repository'
import { UserRole } from '../../entities/user'
import { makePower } from '../../repositories/test/factories/make-power'
import { UnauthorizedError } from '../../core/error/err/unauthorized-error'

let userRepository: InMemoryUserRepository
let powerRepository: InMemoryPowerRepository
let sut: RemovePowerUseCase

describe('RemovePowerUseCase', () => {
  beforeEach(() => {
    userRepository = new InMemoryUserRepository()
    powerRepository = new InMemoryPowerRepository()
    sut = new RemovePowerUseCase(userRepository, powerRepository)
  })

  it('should remove a power successfully', async () => {
    const user = makeUser({
      name: 'John Snow',
      email: 'john@example.com',
      userRole: UserRole.ADMIN,
    })

    await userRepository.create(user)

    const power = makePower({
      name: 'Gelo',
    })

    await powerRepository.create(power)

    const result = await sut.execute({
      adminId: user.id.toString(),
      powerId: power.id.toString(),
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(powerRepository.items.length).toBe(0)
    }
  })

  it('should return an error when user not found', async () => {
    const user = makeUser({
      name: 'John Snow',
      email: 'john@example.com',
      userRole: UserRole.ADMIN,
    })

    await userRepository.create(user)

    const power = makePower({
      name: 'Gelo',
    })

    await powerRepository.create(power)

    const result = await sut.execute({
      adminId: 'non exist',
      powerId: power.id.toString(),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should return an error when user unauthorized', async () => {
    const user = makeUser({
      name: 'John Snow',
      email: 'john@example.com',
      userRole: UserRole.USER,
    })

    await userRepository.create(user)

    const power = makePower({
      name: 'Gelo',
    })

    await powerRepository.create(power)

    const result = await sut.execute({
      adminId: user.id.toString(),
      powerId: power.id.toString(),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(UnauthorizedError)
  })
})
