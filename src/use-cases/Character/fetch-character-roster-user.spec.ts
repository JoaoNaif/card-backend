import { describe, it, expect, beforeEach } from 'vitest'
import { InMemoryUserRepository } from '../../repositories/test/in-memory-user-repository'
import { InMemoryCharacterRepository } from '../../repositories/test/in-memory-character-repository'
import { InMemoryPowerRepository } from '../../repositories/test/in-memory-power-repository'
import { makeUser } from '../../repositories/test/factories/make-user'
import { makeCharacter } from '../../repositories/test/factories/make-character'
import { makePower } from '../../repositories/test/factories/make-power'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'
import { FetchCharacterRosterUserUseCase } from './fetch-character-roster-user'

let userRepository: InMemoryUserRepository
let characterRepository: InMemoryCharacterRepository
let powerRepository: InMemoryPowerRepository
let sut: FetchCharacterRosterUserUseCase

describe('FetchCharacterRosterUserUseCase', () => {
  beforeEach(() => {
    userRepository = new InMemoryUserRepository()
    characterRepository = new InMemoryCharacterRepository()
    powerRepository = new InMemoryPowerRepository()
    sut = new FetchCharacterRosterUserUseCase(
      characterRepository,
      userRepository,
      powerRepository
    )
  })

  it('should return the characters belonging to the user, each with its power', async () => {
    const user = makeUser()
    await userRepository.create(user)

    const userId = user.id.toString()

    const power1 = makePower()
    const power2 = makePower()
    await powerRepository.create(power1)
    await powerRepository.create(power2)

    const char1 = makeCharacter({ userId, powerId: power1.id.toString() })
    const char2 = makeCharacter({ userId, powerId: power2.id.toString() })
    await characterRepository.create(char1)
    await characterRepository.create(char2)

    const result = await sut.execute({ userId })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(result.value.characters).toHaveLength(2)
      expect(result.value.characters.map((c) => c.id)).toEqual(
        expect.arrayContaining([char1.id.toString(), char2.id.toString()])
      )
      expect(result.value.characters.map((c) => c.power.id)).toEqual(
        expect.arrayContaining([power1.id.toString(), power2.id.toString()])
      )
    }
  })

  it('should return an empty array when user has no characters', async () => {
    const user = makeUser()
    await userRepository.create(user)

    const result = await sut.execute({ userId: user.id.toString() })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(result.value.characters).toHaveLength(0)
    }
  })

  it('should not return characters from other users', async () => {
    const user1 = makeUser()
    const user2 = makeUser()
    await userRepository.create(user1)
    await userRepository.create(user2)

    const power = makePower()
    await powerRepository.create(power)

    const char1 = makeCharacter({
      userId: user1.id.toString(),
      powerId: power.id.toString(),
    })
    const char2 = makeCharacter({
      userId: user2.id.toString(),
      powerId: power.id.toString(),
    })
    await characterRepository.create(char1)
    await characterRepository.create(char2)

    const result = await sut.execute({ userId: user1.id.toString() })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(result.value.characters).toHaveLength(1)
      expect(result.value.characters[0]?.id).toBe(char1.id.toString())
    }
  })

  it('should return an error when user does not exist', async () => {
    const result = await sut.execute({ userId: 'non-existent-user' })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should return an error when a character references a power that no longer exists', async () => {
    const user = makeUser()
    await userRepository.create(user)

    const char = makeCharacter({
      userId: user.id.toString(),
      powerId: 'non-existent-power',
    })
    await characterRepository.create(char)

    const result = await sut.execute({ userId: user.id.toString() })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
