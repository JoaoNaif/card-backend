import { describe, it, expect, beforeEach } from 'vitest'
import { InMemoryUserRepository } from '../../repositories/test/in-memory-user-repository'
import { makeUser } from '../../repositories/test/factories/make-user'
import { UserRole } from '../../entities/user'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'
import { InMemoryCharacterRepository } from '../../repositories/test/in-memory-character-repository'
import { makeCharacter } from '../../repositories/test/factories/make-character'
import { RosterFullError } from './err/roster-full-error'
import { SwapCharacterUseCase } from './swap-character'
import { CharacterIncompatibleUser } from './err/character-incompatible-user'

let userRepository: InMemoryUserRepository
let characterRepository: InMemoryCharacterRepository
let sut: SwapCharacterUseCase

describe('SwapCharacterUseCase', () => {
  beforeEach(() => {
    userRepository = new InMemoryUserRepository()
    characterRepository = new InMemoryCharacterRepository()
    sut = new SwapCharacterUseCase(characterRepository, userRepository)
  })

  it('should create a character successfully', async () => {
    const user = makeUser({ userRole: UserRole.ADMIN })

    await userRepository.create(user)

    await Promise.all(
      Array.from({ length: 7 }).map((_, i) =>
        characterRepository.create(
          makeCharacter({ userId: user.id.toString() })
        )
      )
    )

    const removeCharacter = makeCharacter({ userId: user.id.toString() })

    await characterRepository.create(removeCharacter)

    const newCharacter = makeCharacter()

    await characterRepository.create(newCharacter)

    const result = await sut.execute({
      userId: user.id.toString(),
      removeCharacterId: removeCharacter.id.toString(),
      newCharacterId: newCharacter.id.toString(),
    })

    expect(result.isRight()).toBe(true)
    expect(removeCharacter.userId).toEqual(null)
    expect(newCharacter.userId).toEqual(user.id.toString())
  })

  it('should return an error when remove character not found', async () => {
    const user = makeUser({ userRole: UserRole.ADMIN })

    await userRepository.create(user)

    const newCharacter = makeCharacter()

    await characterRepository.create(newCharacter)

    const result = await sut.execute({
      userId: user.id.toString(),
      removeCharacterId: 'error',
      newCharacterId: newCharacter.id.toString(),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should return an error when new character not found', async () => {
    const user = makeUser({ userRole: UserRole.ADMIN })

    await userRepository.create(user)

    const removeCharacter = makeCharacter({ userId: user.id.toString() })

    await characterRepository.create(removeCharacter)

    const result = await sut.execute({
      userId: user.id.toString(),
      removeCharacterId: removeCharacter.id.toString(),
      newCharacterId: 'error',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should return an error when character incompatible', async () => {
    const user = makeUser({ userRole: UserRole.ADMIN })

    await userRepository.create(user)

    const removeCharacter = makeCharacter()

    await characterRepository.create(removeCharacter)

    const result = await sut.execute({
      userId: user.id.toString(),
      removeCharacterId: removeCharacter.id.toString(),
      newCharacterId: 'error',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(CharacterIncompatibleUser)
  })

  it('should return an error when user is not found', async () => {
    const character = makeCharacter()

    await characterRepository.create(character)

    const result = await sut.execute({
      userId: 'error',
      removeCharacterId: character.id.toString(),
      newCharacterId: character.id.toString(),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
