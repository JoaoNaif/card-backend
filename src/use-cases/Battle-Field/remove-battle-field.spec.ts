import { describe, it, expect, beforeEach } from 'vitest'
import { InMemoryUserRepository } from '../../repositories/test/in-memory-user-repository'
import { makeUser } from '../../repositories/test/factories/make-user'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'
import { UserRole } from '../../entities/user'
import { UnauthorizedError } from '../../core/error/err/unauthorized-error'
import { RemoveBattleFieldUseCase } from './remove-battle-field'
import { InMemoryBattleFieldRepository } from '../../repositories/test/in-memory-battle-field-repository'
import { makeBattleField } from '../../repositories/test/factories/make-battle-field'

let userRepository: InMemoryUserRepository
let battleFieldRepository: InMemoryBattleFieldRepository
let sut: RemoveBattleFieldUseCase

describe('RemoveBattleFieldUseCase', () => {
  beforeEach(() => {
    userRepository = new InMemoryUserRepository()
    battleFieldRepository = new InMemoryBattleFieldRepository()
    sut = new RemoveBattleFieldUseCase(userRepository, battleFieldRepository)
  })

  it('should remove a battle field successfully', async () => {
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
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(battleFieldRepository.items.length).toBe(0)
    }
  })

  it('should return an error when user not found', async () => {
    const user = makeUser({
      name: 'John Snow',
      email: 'john@example.com',
      userRole: UserRole.ADMIN,
    })

    await userRepository.create(user)

    const battleField = makeBattleField()

    await battleFieldRepository.create(battleField)

    const result = await sut.execute({
      adminId: 'non exist',
      battleFieldId: battleField.id.toString(),
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

    const battleField = makeBattleField()

    await battleFieldRepository.create(battleField)

    const result = await sut.execute({
      adminId: user.id.toString(),
      battleFieldId: battleField.id.toString(),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(UnauthorizedError)
  })
})
