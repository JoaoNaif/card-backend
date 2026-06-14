import { describe, it, expect, beforeEach } from 'vitest'
import { InMemoryUserRepository } from '../../repositories/test/in-memory-user-repository'
import { makeUser } from '../../repositories/test/factories/make-user'
import { UserRole } from '../../entities/user'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'
import { InMemoryCharacterRepository } from '../../repositories/test/in-memory-character-repository'
import { makeCharacter } from '../../repositories/test/factories/make-character'
import { CreateBattleFieldUseCase } from './create-battle-field'
import { InMemoryBattleFieldRepository } from '../../repositories/test/in-memory-battle-field-repository'
import { InMemoryTraitRepository } from '../../repositories/test/in-memory-trait-repository'
import { makeTrait } from '../../repositories/test/factories/make-trait'
import { UnauthorizedError } from '../../core/error/err/unauthorized-error'
import { makeBattleField } from '../../repositories/test/factories/make-battle-field'
import { ResourceAlreadyExistError } from '../../core/error/err/resource-already-exist-error'

let userRepository: InMemoryUserRepository
let battleFieldRepository: InMemoryBattleFieldRepository
let traitRepository: InMemoryTraitRepository
let sut: CreateBattleFieldUseCase

describe('CreateBattleFieldUseCase', () => {
  beforeEach(() => {
    userRepository = new InMemoryUserRepository()
    battleFieldRepository = new InMemoryBattleFieldRepository()
    traitRepository = new InMemoryTraitRepository()
    sut = new CreateBattleFieldUseCase(
      battleFieldRepository,
      userRepository,
      traitRepository
    )
  })

  it('should create a battle field successfully', async () => {
    const user = makeUser({ userRole: UserRole.ADMIN })

    await userRepository.create(user)

    const trait = makeTrait({
      name: 'Nadador',
    })

    await traitRepository.create(trait)

    const result = await sut.execute({
      name: 'Alto Mar',
      description:
        'Campo com origem no mar, dizem que mesmo que olhem pro fundo nunca encontraram o fundo do abismo',
      userId: user.id.toString(),
      modifiers: [
        {
          traitId: trait.id.toString(),
          bonusType: 'PERCENT',
          stat: 'ATK',
          bonusValue: 5,
        },
      ],
    })

    expect(result.isRight()).toBe(true)
    expect(battleFieldRepository.items[0]?.name).toEqual('Alto Mar')
  })

  it('should return an error when battle field already exist', async () => {
    const user = makeUser({ userRole: UserRole.ADMIN })

    await userRepository.create(user)

    const trait = makeTrait({
      name: 'Nadador',
    })

    await traitRepository.create(trait)

    const battleField = makeBattleField({
      name: 'Alto Mar',
    })

    await battleFieldRepository.create(battleField)

    const result = await sut.execute({
      name: 'Alto Mar',
      description:
        'Campo com origem no mar, dizem que mesmo que olhem pro fundo nunca encontraram o fundo do abismo',
      userId: user.id.toString(),
      modifiers: [
        {
          traitId: trait.id.toString(),
          bonusType: 'PERCENT',
          stat: 'ATK',
          bonusValue: 5,
        },
      ],
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceAlreadyExistError)
  })

  it('should return an error when user is not an admin', async () => {
    const user = makeUser({ userRole: UserRole.USER })

    await userRepository.create(user)

    const trait = makeTrait({
      name: 'Nadador',
    })

    await traitRepository.create(trait)

    const result = await sut.execute({
      name: 'Alto Mar',
      description:
        'Campo com origem no mar, dizem que mesmo que olhem pro fundo nunca encontraram o fundo do abismo',
      userId: user.id.toString(),
      modifiers: [
        {
          traitId: trait.id.toString(),
          bonusType: 'PERCENT',
          stat: 'ATK',
          bonusValue: 5,
        },
      ],
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(UnauthorizedError)
  })

  it('should return an error when trait not found', async () => {
    const user = makeUser({ userRole: UserRole.ADMIN })

    await userRepository.create(user)

    const result = await sut.execute({
      name: 'Alto Mar',
      description:
        'Campo com origem no mar, dizem que mesmo que olhem pro fundo nunca encontraram o fundo do abismo',
      userId: user.id.toString(),
      modifiers: [
        {
          traitId: 'non exist',
          bonusType: 'PERCENT',
          stat: 'ATK',
          bonusValue: 5,
        },
      ],
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should return an error when user not found', async () => {
    const trait = makeTrait({
      name: 'Nadador',
    })

    await traitRepository.create(trait)

    const result = await sut.execute({
      name: 'Alto Mar',
      description:
        'Campo com origem no mar, dizem que mesmo que olhem pro fundo nunca encontraram o fundo do abismo',
      userId: 'non exist',
      modifiers: [
        {
          traitId: trait.id.toString(),
          bonusType: 'PERCENT',
          stat: 'ATK',
          bonusValue: 5,
        },
      ],
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
