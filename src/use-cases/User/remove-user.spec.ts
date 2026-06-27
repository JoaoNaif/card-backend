import { describe, it, expect, beforeEach } from 'vitest'
import { InMemoryUserRepository } from '../../repositories/test/in-memory-user-repository'
import { makeUser } from '../../repositories/test/factories/make-user'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'
import { RemoveUserUseCase } from './remove-user'

let userRepository: InMemoryUserRepository
let sut: RemoveUserUseCase

describe('RemoveUserUseCase', () => {
  beforeEach(() => {
    userRepository = new InMemoryUserRepository()
    sut = new RemoveUserUseCase(userRepository)
  })

  it('should remove a user successfully', async () => {
    const user = makeUser({
      name: 'John Snow',
      email: 'john@example.com',
    })

    await userRepository.create(user)

    const result = await sut.execute({
      userId: user.id.toString(),
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(userRepository.items.length).toBe(0)
    }
  })

  it('should return an error when user not found', async () => {
    const result = await sut.execute({
      userId: 'non exist',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
