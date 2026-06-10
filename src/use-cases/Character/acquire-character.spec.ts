import { describe, it, expect, beforeEach } from 'vitest'
import { InMemoryUserRepository } from '../../repositories/test/in-memory-user-repository'
import { makeUser } from '../../repositories/test/factories/make-user'
import { UserRole } from '../../entities/user'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'
import { InMemoryCharacterRepository } from '../../repositories/test/in-memory-character-repository'
import { AcquireCharacterUseCase } from './acquire-character'
import { makeCharacter } from '../../repositories/test/factories/make-character'

let userRepository: InMemoryUserRepository
let characterRepository: InMemoryCharacterRepository
let sut: AcquireCharacterUseCase

describe('AcquireCharacterUseCase', () => {
  beforeEach(() => {
    userRepository = new InMemoryUserRepository()
    characterRepository = new InMemoryCharacterRepository()
    sut = new AcquireCharacterUseCase(characterRepository, userRepository)
  })

  it('should create a character successfully', async () => {
    const user = makeUser({ userRole: UserRole.ADMIN })

    await userRepository.create(user)

    const character = makeCharacter()

    await characterRepository.create(character)

    const result = await sut.execute({
      userId: user.id.toString(),
      characterId: character.id.toString(),
    })

    expect(result.isRight()).toBe(true)
    expect(characterRepository.items[0]?.userId).toEqual(user.id.toString())
  })

  it('should return an error when character not found', async () => {
    const user = makeUser({ userRole: UserRole.ADMIN })

    await userRepository.create(user)

    const result = await sut.execute({
      userId: user.id.toString(),
      characterId: 'error',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should return an error when user is not found', async () => {
    const character = makeCharacter()

    await characterRepository.create(character)

    const result = await sut.execute({
      userId: 'error',
      characterId: character.id.toString(),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
