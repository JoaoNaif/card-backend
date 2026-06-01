import { describe, it, expect, beforeEach } from 'vitest'
import { InMemoryUserRepository } from '../../repositories/test/in-memory-user-repository'
import { GetUserUseCase } from './get-user'
import { makeUser } from '../../repositories/test/factories/make-user'

let userRepository: InMemoryUserRepository
let sut: GetUserUseCase

describe('GetUserUseCase', () => {
  beforeEach(() => {
    userRepository = new InMemoryUserRepository()
    sut = new GetUserUseCase(userRepository)
  })

  it('should create a user successfully', async () => {
    const user = makeUser({
      email: 'john@example.com',
      name: 'John Doe',
    })

    await userRepository.create(user)

    const result = await sut.execute({
      id: user.id.toString(),
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(result.value.user.name).toBe('John Doe')
      expect(result.value.user.email).toBe('john@example.com')
      expect(result.value.user.id).toBeDefined()
      expect(result.value.user.createdAt).toBeInstanceOf(Date)
    }
  })
})
