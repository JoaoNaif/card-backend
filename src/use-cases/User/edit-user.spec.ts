import { describe, it, expect, beforeEach } from 'vitest'
import { InMemoryUserRepository } from '../../repositories/test/in-memory-user-repository'
import { EditUserUseCase } from './edit-user'
import { makeUser } from '../../repositories/test/factories/make-user'
import { ResourceAlreadyExistError } from '../../core/error/err/resource-already-exist-error'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'

let userRepository: InMemoryUserRepository
let sut: EditUserUseCase

describe('EditUserUseCase', () => {
  beforeEach(() => {
    userRepository = new InMemoryUserRepository()
    sut = new EditUserUseCase(userRepository)
  })

  it('should edit a user successfully', async () => {
    const user = makeUser({
      name: 'John Snow',
      email: 'john@example.com',
    })

    await userRepository.create(user)

    const result = await sut.execute({
      userId: user.id.toString(),
      name: 'John Doe',
      email: 'johnDoe@example.com',
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(user.name).toBe('John Doe')
      expect(user.email).toBe('johnDoe@example.com')
    }
  })

  it('should return an error when email is already in use', async () => {
    const user = makeUser({
      name: 'John Snow',
      email: 'john@example.com',
    })

    await userRepository.create(user)

    const result = await sut.execute({
      userId: user.id.toString(),
      name: 'John Doe',
      email: 'john@example.com',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceAlreadyExistError)
  })

  it('should return an error when user not found', async () => {
    const result = await sut.execute({
      userId: 'non exist',
      name: 'John Doe',
      email: 'john@example.com',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
