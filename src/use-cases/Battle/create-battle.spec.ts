import { describe, it, expect, beforeEach } from 'vitest'
import { InMemoryBattleRepository } from '../../repositories/test/in-memory-battle-repository'
import { InMemoryBattleFieldRepository } from '../../repositories/test/in-memory-battle-field-repository'
import { makeBattleField } from '../../repositories/test/factories/make-battle-field'
import { CreateBattleUseCase } from './create-battle'
import { BattleMode, BattleStatus } from '../../entities/battle'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'

let battleRepository: InMemoryBattleRepository
let battleFieldRepository: InMemoryBattleFieldRepository
let sut: CreateBattleUseCase

describe('CreateBattleUseCase', () => {
  beforeEach(() => {
    battleRepository = new InMemoryBattleRepository()
    battleFieldRepository = new InMemoryBattleFieldRepository()
    sut = new CreateBattleUseCase(battleRepository, battleFieldRepository)
  })

  it('should create an AUTO battle with COMPLETED status', async () => {
    const battleField = makeBattleField()
    await battleFieldRepository.create(battleField)

    const result = await sut.execute({
      mode: BattleMode.AUTO,
      battleFieldId: battleField.id.toString(),
      log: [],
    })

    expect(result.isRight()).toBe(true)
    expect(battleRepository.items[0]?.status).toBe(BattleStatus.COMPLETED)
    expect(battleRepository.items[0]?.mode).toBe(BattleMode.AUTO)
  })

  it('should create a PVE battle with ACTIVE status', async () => {
    const battleField = makeBattleField()
    await battleFieldRepository.create(battleField)

    const result = await sut.execute({
      mode: BattleMode.PVE,
      battleFieldId: battleField.id.toString(),
      log: [],
    })

    expect(result.isRight()).toBe(true)
    expect(battleRepository.items[0]?.status).toBe(BattleStatus.ACTIVE)
  })

  it('should create a PVP battle with ACTIVE status', async () => {
    const battleField = makeBattleField()
    await battleFieldRepository.create(battleField)

    const result = await sut.execute({
      mode: BattleMode.PVP,
      battleFieldId: battleField.id.toString(),
      log: [],
    })

    expect(result.isRight()).toBe(true)
    expect(battleRepository.items[0]?.status).toBe(BattleStatus.ACTIVE)
  })

  it('should create battle with maxTurns when provided', async () => {
    const battleField = makeBattleField()
    await battleFieldRepository.create(battleField)

    const result = await sut.execute({
      mode: BattleMode.AUTO,
      battleFieldId: battleField.id.toString(),
      log: [],
      maxTurns: 100,
    })

    expect(result.isRight()).toBe(true)
    expect(battleRepository.items[0]?.maxTurns).toBe(100)
  })

  it('should return error when battleField not found', async () => {
    const result = await sut.execute({
      mode: BattleMode.AUTO,
      battleFieldId: 'non-existent-id',
      log: [],
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
