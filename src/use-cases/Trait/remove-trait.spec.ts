import { describe, it, expect, beforeEach } from 'vitest'
import { InMemoryUserRepository } from '../../repositories/test/in-memory-user-repository'
import { makeUser } from '../../repositories/test/factories/make-user'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'
import { UserRole } from '../../entities/user'
import { UnauthorizedError } from '../../core/error/err/unauthorized-error'
import { InMemoryTraitRepository } from '../../repositories/test/in-memory-trait-repository'
import { makeTrait } from '../../repositories/test/factories/make-trait'
import { RemoveTraitUseCase } from './remove-trait'

let userRepository: InMemoryUserRepository
let traitRepository: InMemoryTraitRepository
let sut: RemoveTraitUseCase

describe('RemoveTraitUseCase', () => {
  beforeEach(() => {
    userRepository = new InMemoryUserRepository()
    traitRepository = new InMemoryTraitRepository()
    sut = new RemoveTraitUseCase(userRepository, traitRepository)
  })

  it('should remove a trait successfully', async () => {
    const user = makeUser({
      name: 'John Snow',
      email: 'john@example.com',
      userRole: UserRole.ADMIN,
    })

    await userRepository.create(user)

    const trait = makeTrait()

    await traitRepository.create(trait)

    const result = await sut.execute({
      adminId: user.id.toString(),
      traitId: trait.id.toString(),
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(traitRepository.items.length).toBe(0)
    }
  })

  it('should return an error when user not found', async () => {
    const user = makeUser({
      name: 'John Snow',
      email: 'john@example.com',
      userRole: UserRole.ADMIN,
    })

    await userRepository.create(user)

    const trait = makeTrait()

    await traitRepository.create(trait)

    const result = await sut.execute({
      adminId: 'non exist',
      traitId: trait.id.toString(),
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

    const trait = makeTrait()

    await traitRepository.create(trait)

    const result = await sut.execute({
      adminId: user.id.toString(),
      traitId: trait.id.toString(),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(UnauthorizedError)
  })
})
