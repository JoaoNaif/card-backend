import { describe, it, expect, beforeEach } from 'vitest'
import { InMemoryUserRepository } from '../../repositories/test/in-memory-user-repository'
import { makeUser } from '../../repositories/test/factories/make-user'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'
import { UserRole } from '../../entities/user'
import { UnauthorizedError } from '../../core/error/err/unauthorized-error'
import { RemoveCharacterUseCase } from './remove-character'
import { InMemoryCharacterRepository } from '../../repositories/test/in-memory-character-repository'
import { makeCharacter } from '../../repositories/test/factories/make-character'

let userRepository: InMemoryUserRepository
let characterRepository: InMemoryCharacterRepository
let sut: RemoveCharacterUseCase

describe('RemoveCharacterUseCase', () => {
  beforeEach(() => {
    userRepository = new InMemoryUserRepository()
    characterRepository = new InMemoryCharacterRepository()
    sut = new RemoveCharacterUseCase(userRepository, characterRepository)
  })

  it('should remove a character successfully', async () => {
    const user = makeUser({
      name: 'John Snow',
      email: 'john@example.com',
      userRole: UserRole.ADMIN,
    })

    await userRepository.create(user)

    const character = makeCharacter()

    await characterRepository.create(character)

    const result = await sut.execute({
      adminId: user.id.toString(),
      characterId: character.id.toString(),
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(characterRepository.items.length).toBe(0)
    }
  })

  it('should return an error when user not found', async () => {
    const user = makeUser({
      name: 'John Snow',
      email: 'john@example.com',
      userRole: UserRole.ADMIN,
    })

    await userRepository.create(user)

    const character = makeCharacter()

    await characterRepository.create(character)

    const result = await sut.execute({
      adminId: 'non exist',
      characterId: character.id.toString(),
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

    const character = makeCharacter()

    await characterRepository.create(character)

    const result = await sut.execute({
      adminId: user.id.toString(),
      characterId: character.id.toString(),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(UnauthorizedError)
  })
})
