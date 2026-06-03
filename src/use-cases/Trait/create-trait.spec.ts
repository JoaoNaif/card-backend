import { describe, it, expect, beforeEach } from 'vitest'
import { InMemoryUserRepository } from '../../repositories/test/in-memory-user-repository'
import { BcryptHasher } from '../../repositories/cryptography/bcrypt-hasher'
import { CreateTraitUseCase } from './create-trait'
import { InMemoryTraitRepository } from '../../repositories/test/in-memory-trait-repository'
import { makeUser } from '../../repositories/test/factories/make-user'
import { UserRole } from '../../entities/user'
import { UnauthorizedError } from '../../core/error/err/unauthorized-error'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'

let userRepository: InMemoryUserRepository
let traitRepository: InMemoryTraitRepository
let sut: CreateTraitUseCase

describe('CreateTraitUseCase', () => {
  beforeEach(() => {
    userRepository = new InMemoryUserRepository()
    traitRepository = new InMemoryTraitRepository()
    sut = new CreateTraitUseCase(traitRepository, userRepository)
  })

  it('should create a trait successfully', async () => {
    const user = makeUser({ userRole: UserRole.ADMIN })

    await userRepository.create(user)

    const result = await sut.execute({
      userId: user.id.toString(),
      name: 'Brave',
      description: 'A brave trait',
    })

    expect(result.isRight()).toBe(true)
    expect(userRepository.items).toHaveLength(1)

    if (result.isRight()) {
      expect(result.value.trait.name).toBe('Brave')
      expect(result.value.trait.description).toBe('A brave trait')
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
