import { describe, it, expect, beforeEach } from 'vitest'
import { InMemoryUserRepository } from '../../repositories/test/in-memory-user-repository'
import { makeUser } from '../../repositories/test/factories/make-user'
import { ResourceAlreadyExistError } from '../../core/error/err/resource-already-exist-error'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'
import { makePower } from '../../repositories/test/factories/make-power'
import { Pillar } from '../../entities/power'
import { UserRole } from '../../entities/user'
import { UnauthorizedError } from '../../core/error/err/unauthorized-error'
import { EditBattleFieldUseCase } from './edit-battle-field'
import { InMemoryBattleFieldRepository } from '../../repositories/test/in-memory-battle-field-repository'
import { makeBattleField } from '../../repositories/test/factories/make-battle-field'

let userRepository: InMemoryUserRepository
let battleFieldRepository: InMemoryBattleFieldRepository
let sut: EditBattleFieldUseCase

describe('EditBattleFieldUseCase', () => {
  beforeEach(() => {
    userRepository = new InMemoryUserRepository()
    battleFieldRepository = new InMemoryBattleFieldRepository()
    sut = new EditBattleFieldUseCase(userRepository, battleFieldRepository)
  })

  it('should edit a user successfully', async () => {
    const user = makeUser({
      name: 'John Snow',
      email: 'john@example.com',
      userRole: UserRole.ADMIN,
    })

    await userRepository.create(user)

    const battleField = makeBattleField()

    await battleFieldRepository.create(battleField)

    const result = await sut.execute({
      adminId: user.id.toString(),
      battleFieldId: battleField.id.toString(),
      name: 'Gelo Negro',
      description: 'Manipula o gelo',
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(battleField.name).toBe('Gelo Negro')
      expect(battleField.description).toBe('Manipula o gelo')
    }
  })

  it('should return an error when user admin', async () => {
    const user = makeUser({
      name: 'John Snow',
      email: 'john@example.com',
      userRole: UserRole.USER,
    })

    await userRepository.create(user)

    const battleField = makeBattleField()

    await battleFieldRepository.create(battleField)

    const result = await sut.execute({
      adminId: user.id.toString(),
      battleFieldId: battleField.id.toString(),
      name: 'Gelo Negro',
      description: 'Manipula o gelo',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(UnauthorizedError)
  })

  it('should return an error when name is already in use', async () => {
    const user = makeUser({
      name: 'John Snow',
      email: 'john@example.com',
      userRole: UserRole.ADMIN,
    })

    await userRepository.create(user)

    const battleField = makeBattleField({
      name: 'Gelo Negro',
    })

    await battleFieldRepository.create(battleField)

    const result = await sut.execute({
      adminId: user.id.toString(),
      battleFieldId: battleField.id.toString(),
      name: 'Gelo Negro',
      description: 'Manipula o gelo',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceAlreadyExistError)
  })

  it('should return an error when user not found', async () => {
    const battleField = makeBattleField()

    await battleFieldRepository.create(battleField)

    const result = await sut.execute({
      adminId: 'non exist',
      battleFieldId: battleField.id.toString(),
      name: 'Gelo Negro',
      description: 'Manipula o gelo',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should return an error when power not found', async () => {
    const user = makeUser({
      name: 'John Snow',
      email: 'john@example.com',
      userRole: UserRole.USER,
    })

    await userRepository.create(user)

    const result = await sut.execute({
      adminId: user.id.toString(),
      battleFieldId: 'non exist',
      name: 'Gelo Negro',
      description: 'Manipula o gelo',
    })
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(UnauthorizedError)
  })
})
