import { describe, it, expect, beforeEach } from 'vitest'
import { InMemoryUserRepository } from '../../repositories/test/in-memory-user-repository'
import { makeUser } from '../../repositories/test/factories/make-user'
import { ResourceAlreadyExistError } from '../../core/error/err/resource-already-exist-error'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'
import { EditPowerUseCase } from './edit-power'
import { InMemoryPowerRepository } from '../../repositories/test/in-memory-power-repository'
import { makePower } from '../../repositories/test/factories/make-power'
import { Pillar } from '../../entities/power'
import { UserRole } from '../../entities/user'
import { UnauthorizedError } from '../../core/error/err/unauthorized-error'

let userRepository: InMemoryUserRepository
let powerRepository: InMemoryPowerRepository
let sut: EditPowerUseCase

describe('EditPowerUseCase', () => {
  beforeEach(() => {
    userRepository = new InMemoryUserRepository()
    powerRepository = new InMemoryPowerRepository()
    sut = new EditPowerUseCase(userRepository, powerRepository)
  })

  it('should edit a user successfully', async () => {
    const user = makeUser({
      name: 'John Snow',
      email: 'john@example.com',
      userRole: UserRole.ADMIN,
    })

    await userRepository.create(user)

    const power = makePower({
      name: 'Gelo',
      description: 'Manipula a temperatura, esfriando ela',
      pillar: Pillar.MATERIAL,
    })

    await powerRepository.create(power)

    const result = await sut.execute({
      adminId: user.id.toString(),
      powerId: power.id.toString(),
      name: 'Gelo Negro',
      description: 'Manipula o gelo',
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(power.name).toBe('Gelo Negro')
      expect(power.description).toBe('Manipula o gelo')
    }
  })

  it('should return an error when user admin', async () => {
    const user = makeUser({
      name: 'John Snow',
      email: 'john@example.com',
      userRole: UserRole.USER,
    })

    await userRepository.create(user)

    const power = makePower({
      name: 'Gelo',
      description: 'Manipula a temperatura, esfriando ela',
      pillar: Pillar.MATERIAL,
    })

    await powerRepository.create(power)

    const result = await sut.execute({
      adminId: user.id.toString(),
      powerId: power.id.toString(),
      name: 'Gelo Negro',
      description: 'Manipula o gelo',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(UnauthorizedError)
  })

  it('should return an error when name is already in use', async () => {
    const user = makeUser({
      name: 'John Snow',
      email: 'john@example.com',
      userRole: UserRole.ADMIN,
    })

    await userRepository.create(user)

    const power = makePower({
      name: 'Gelo',
      description: 'Manipula a temperatura, esfriando ela',
      pillar: Pillar.MATERIAL,
    })

    await powerRepository.create(power)

    const result = await sut.execute({
      adminId: user.id.toString(),
      powerId: power.id.toString(),
      name: 'Gelo',
      description: 'Manipula o gelo',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceAlreadyExistError)
  })

  it('should return an error when user not found', async () => {
    const power = makePower({
      name: 'Gelo',
      description: 'Manipula a temperatura, esfriando ela',
      pillar: Pillar.MATERIAL,
    })

    await powerRepository.create(power)

    const result = await sut.execute({
      adminId: 'non exist',
      powerId: power.id.toString(),
      name: 'Gelo Negro',
      description: 'Manipula o gelo',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should return an error when power not found', async () => {
    const user = makeUser({
      name: 'John Snow',
      email: 'john@example.com',
      userRole: UserRole.USER,
    })

    await userRepository.create(user)

    const result = await sut.execute({
      adminId: user.id.toString(),
      powerId: 'non power',
      name: 'Gelo Negro',
      description: 'Manipula o gelo',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(UnauthorizedError)
  })
})
