import { describe, it, expect, beforeEach } from 'vitest'
import { InMemoryUserRepository } from '../../repositories/test/in-memory-user-repository'
import { makeUser } from '../../repositories/test/factories/make-user'
import { ResourceAlreadyExistError } from '../../core/error/err/resource-already-exist-error'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'
import { UserRole } from '../../entities/user'
import { UnauthorizedError } from '../../core/error/err/unauthorized-error'
import { EditCharacterUseCase } from './edit-character'
import { InMemoryCharacterRepository } from '../../repositories/test/in-memory-character-repository'
import { makeCharacter } from '../../repositories/test/factories/make-character'

let userRepository: InMemoryUserRepository
let characterRepository: InMemoryCharacterRepository
let sut: EditCharacterUseCase

describe('EditCharacterUseCase', () => {
  beforeEach(() => {
    userRepository = new InMemoryUserRepository()
    characterRepository = new InMemoryCharacterRepository()
    sut = new EditCharacterUseCase(userRepository, characterRepository)
  })

  it('should edit a character successfully', async () => {
    const user = makeUser({
      name: 'John Snow',
      email: 'john@example.com',
      userRole: UserRole.ADMIN,
    })

    await userRepository.create(user)

    const character = makeCharacter({
      name: 'Fulano',
      description: 'Teste testando',
    })

    await characterRepository.create(character)

    const result = await sut.execute({
      adminId: user.id.toString(),
      characterId: character.id.toString(),
      name: 'Beltrano',
      description: 'Manipula o gelo',
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(character.name).toBe('Beltrano')
      expect(character.description).toBe('Manipula o gelo')
    }
  })

  it('should return an error when user is not admin', async () => {
    const user = makeUser({
      name: 'John Snow',
      email: 'john@example.com',
      userRole: UserRole.USER,
    })

    await userRepository.create(user)

    const character = makeCharacter({
      name: 'Fulano',
      description: 'Teste testando',
    })

    await characterRepository.create(character)

    const result = await sut.execute({
      adminId: user.id.toString(),
      characterId: character.id.toString(),
      name: 'Beltrano',
      description: 'Manipula o gelo',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(UnauthorizedError)
  })

  it('should return an error when character not found', async () => {
    const user = makeUser({
      name: 'John Snow',
      email: 'john@example.com',
      userRole: UserRole.ADMIN,
    })

    await userRepository.create(user)

    const result = await sut.execute({
      adminId: user.id.toString(),
      characterId: 'non-existent-character',
      name: 'Beltrano',
      description: 'Manipula o gelo',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should return an error when name is already in use', async () => {
    const user = makeUser({
      name: 'John Snow',
      email: 'john@example.com',
      userRole: UserRole.ADMIN,
    })

    await userRepository.create(user)

    await characterRepository.create(
      makeCharacter({ name: 'Beltrano', description: 'Já existe' })
    )

    const character = makeCharacter({
      name: 'Fulano',
      description: 'Teste testando',
    })

    await characterRepository.create(character)

    const result = await sut.execute({
      adminId: user.id.toString(),
      characterId: character.id.toString(),
      name: 'Beltrano',
      description: 'Manipula o gelo',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceAlreadyExistError)
  })

  it('should return an error when user not found', async () => {
    const character = makeCharacter({
      name: 'Fulano',
      description: 'Teste testando',
    })

    await characterRepository.create(character)

    const result = await sut.execute({
      adminId: 'non exist user',
      characterId: character.id.toString(),
      name: 'Beltrano',
      description: 'Manipula o gelo',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
