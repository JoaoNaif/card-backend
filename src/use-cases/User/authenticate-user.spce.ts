import { describe, it, expect, beforeEach } from 'vitest'
import { InMemoryUserRepository } from '../../repositories/test/in-memory-user-repository'
import { AuthenticateUserUseCase } from './authenticate-user'
import { FakeEncrypter } from '../../test/cryptography/fake-encrypter'
import { FakeHasher } from '../../test/cryptography/fake-hashser'
import { makeUser } from '../../repositories/test/factories/make-user'
import { WrongCredentialsError } from './err/wrong-credentials-error'

let userRepository: InMemoryUserRepository
let hashGenerator: FakeHasher
let encrypter: FakeEncrypter
let sut: AuthenticateUserUseCase

describe('AuthenticateUserUseCase', () => {
  beforeEach(() => {
    userRepository = new InMemoryUserRepository()
    hashGenerator = new FakeHasher()
    encrypter = new FakeEncrypter()

    sut = new AuthenticateUserUseCase(userRepository, hashGenerator, encrypter)
  })

  it('should authenticate a user successfully', async () => {
    const user = makeUser({
      email: 'john@example.com',
      passwordHash: await hashGenerator.hash('123456'),
    })

    const result = await sut.execute({
      email: 'john@example.com',
      password: '123456',
    })

    expect(result.isRight()).toBe(true)
    expect(userRepository.items).toHaveLength(1)

    if (result.isRight()) {
      expect(result.value).toBe({
        acessToken: expect.any(String),
      })
    }
  })

  it('should not be able to authenticate with invalid credentials', async () => {
    const user = makeUser({
      email: 'john@example.com',
      passwordHash: await hashGenerator.hash('123456'),
    })

    const result = await sut.execute({
      email: 'john@example.com',
      password: 'wrong-password',
    })

    expect(result.isRight()).toBe(false)
    expect(userRepository.items).toHaveLength(1)

    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(WrongCredentialsError)
    }
  })
})
