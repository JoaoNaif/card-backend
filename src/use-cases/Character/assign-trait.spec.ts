import { describe, it, expect, beforeEach } from 'vitest'
import { InMemoryCharacterRepository } from '../../repositories/test/in-memory-character-repository'
import { InMemoryUserRepository } from '../../repositories/test/in-memory-user-repository'
import { InMemoryTraitRepository } from '../../repositories/test/in-memory-trait-repository'
import { makeCharacter } from '../../repositories/test/factories/make-character'
import { makeUser } from '../../repositories/test/factories/make-user'
import { makeTrait } from '../../repositories/test/factories/make-trait'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'
import { UnauthorizedError } from '../../core/error/err/unauthorized-error'
import { AssignTraitUseCase } from './assign-trait'

let characterRepository: InMemoryCharacterRepository
let userRepository: InMemoryUserRepository
let traitRepository: InMemoryTraitRepository
let sut: AssignTraitUseCase

describe('AssignTraitUseCase', () => {
  beforeEach(() => {
    characterRepository = new InMemoryCharacterRepository()
    userRepository = new InMemoryUserRepository()
    traitRepository = new InMemoryTraitRepository()
    sut = new AssignTraitUseCase(characterRepository, userRepository, traitRepository)
  })

  it('should assign a trait to a character successfully', async () => {
    const user = makeUser()
    await userRepository.create(user)

    const character = makeCharacter({ userId: user.id.toString() })
    await characterRepository.create(character)

    const trait = makeTrait()
    await traitRepository.create(trait)

    const result = await sut.execute({
      userId: user.id.toString(),
      characterId: character.id.toString(),
      traitId: trait.id.toString(),
    })

    expect(result.isRight()).toBe(true)
    const assignments = characterRepository.traitAssignments.get(character.id.toString())
    expect(assignments?.has(trait.id.toString())).toBe(true)
  })

  it('should return NotFoundError when user does not exist', async () => {
    const character = makeCharacter()
    await characterRepository.create(character)

    const trait = makeTrait()
    await traitRepository.create(trait)

    const result = await sut.execute({
      userId: 'non-existent-user',
      characterId: character.id.toString(),
      traitId: trait.id.toString(),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should return NotFoundError when character does not exist', async () => {
    const user = makeUser()
    await userRepository.create(user)

    const trait = makeTrait()
    await traitRepository.create(trait)

    const result = await sut.execute({
      userId: user.id.toString(),
      characterId: 'non-existent-character',
      traitId: trait.id.toString(),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should return NotFoundError when trait does not exist', async () => {
    const user = makeUser()
    await userRepository.create(user)

    const character = makeCharacter({ userId: user.id.toString() })
    await characterRepository.create(character)

    const result = await sut.execute({
      userId: user.id.toString(),
      characterId: character.id.toString(),
      traitId: 'non-existent-trait',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should return UnauthorizedError when character does not belong to user', async () => {
    const user = makeUser()
    await userRepository.create(user)

    const character = makeCharacter({ userId: 'another-user-id' })
    await characterRepository.create(character)

    const trait = makeTrait()
    await traitRepository.create(trait)

    const result = await sut.execute({
      userId: user.id.toString(),
      characterId: character.id.toString(),
      traitId: trait.id.toString(),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(UnauthorizedError)
  })
})
