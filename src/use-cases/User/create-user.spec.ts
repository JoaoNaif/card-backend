import { describe, it, expect, beforeEach } from 'vitest'
import { CreateUserUseCase } from './create-user'
import { InMemoryUserRepository } from '../../repositories/test/in-memory-user-repository'

let userRepository: InMemoryUserRepository
let sut: CreateUserUseCase

describe('CreateUserUseCase', () => {
  beforeEach(() => {
    userRepository = new InMemoryUserRepository()
    sut = new CreateUserUseCase(userRepository)
  })

  it('should create a user successfully', async () => {
    const result = await sut.execute({
      name: 'John Doe',
      email: 'john@example.com',
    })

    expect(result.isRight()).toBe(true)
    expect(userRepository.items).toHaveLength(1)

    if (result.isRight()) {
      expect(result.value.user.name).toBe('John Doe')
      expect(result.value.user.email).toBe('john@example.com')
      expect(result.value.user.id).toBeDefined()
      expect(result.value.user.createdAt).toBeInstanceOf(Date)
    }
  })

  it('should return an error when email is already in use', async () => {
    await sut.execute({ name: 'John Doe', email: 'john@example.com' })

    const result = await sut.execute({
      name: 'Other User',
      email: 'john@example.com',
    })

    expect(result.isLeft()).toBe(true)
    expect(userRepository.items).toHaveLength(1)
  })

  it('should persist the user in the repository', async () => {
    await sut.execute({ name: 'Jane Doe', email: 'jane@example.com' })

    const stored = await userRepository.findByEmail('jane@example.com')

    expect(stored).not.toBeNull()
    expect(stored?.name).toBe('Jane Doe')
  })
})
