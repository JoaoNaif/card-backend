import { describe, it, expect, beforeEach } from 'vitest'
import { InMemoryUserRepository } from '../../repositories/test/in-memory-user-repository'
import { makeUser } from '../../repositories/test/factories/make-user'
import { ResourceAlreadyExistError } from '../../core/error/err/resource-already-exist-error'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'
import { makePower } from '../../repositories/test/factories/make-power'
import { Pillar } from '../../entities/power'
import { UserRole } from '../../entities/user'
import { UnauthorizedError } from '../../core/error/err/unauthorized-error'
import { EditTraitUseCase } from './edit-trait'
import { makeTrait } from '../../repositories/test/factories/make-trait'
import { InMemoryTraitRepository } from '../../repositories/test/in-memory-trait-repository'

let userRepository: InMemoryUserRepository
let traitRepository: InMemoryTraitRepository
let sut: EditTraitUseCase

describe('EditTraitUseCase', () => {
  beforeEach(() => {
    userRepository = new InMemoryUserRepository()
    traitRepository = new InMemoryTraitRepository()
    sut = new EditTraitUseCase(userRepository, traitRepository)
  })

  it('should edit a user successfully', async () => {
    const user = makeUser({
      name: 'John Snow',
      email: 'john@example.com',
      userRole: UserRole.ADMIN,
    })

    await userRepository.create(user)

    const trait = makeTrait({
      name: 'Especialista',
    })

    await traitRepository.create(trait)

    const result = await sut.execute({
      adminId: user.id.toString(),
      traitId: trait.id.toString(),
      name: 'Furtividade',
      description: 'É completamente oculto',
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(trait.name).toBe('Furtividade')
      expect(trait.description).toBe('É completamente oculto')
    }
  })

  it('should return an error when user admin', async () => {
    const user = makeUser({
      name: 'John Snow',
      email: 'john@example.com',
      userRole: UserRole.USER,
    })

    await userRepository.create(user)

    const trait = makeTrait({
      name: 'Especialista',
    })

    await traitRepository.create(trait)

    const result = await sut.execute({
      adminId: user.id.toString(),
      traitId: trait.id.toString(),
      name: 'Furtividade',
      description: 'É completamente oculto',
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

    const trait = makeTrait({
      name: 'Especialista',
    })

    await traitRepository.create(trait)

    const result = await sut.execute({
      adminId: user.id.toString(),
      traitId: trait.id.toString(),
      name: 'Especialista',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceAlreadyExistError)
  })

  it('should return an error when user not found', async () => {
    const trait = makeTrait({
      name: 'Especialista',
    })

    await traitRepository.create(trait)

    const result = await sut.execute({
      adminId: 'non exist',
      traitId: trait.id.toString(),
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
      traitId: 'non trait',
      name: 'Gelo Negro',
      description: 'Manipula o gelo',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(UnauthorizedError)
  })
})
