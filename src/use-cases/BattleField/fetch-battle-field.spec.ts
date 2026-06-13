import { describe, it, expect, beforeEach, assert } from 'vitest'
import { FetchBattleFieldUseCase } from './fetch-battle-field'
import { InMemoryBattleFieldRepository } from '../../repositories/test/in-memory-battle-field-repository'
import { makeBattleField } from '../../repositories/test/factories/make-battle-field'

let battleFieldRepository: InMemoryBattleFieldRepository
let sut: FetchBattleFieldUseCase

describe('FetchBattleFieldUseCase', () => {
  beforeEach(() => {
    battleFieldRepository = new InMemoryBattleFieldRepository()
    sut = new FetchBattleFieldUseCase(battleFieldRepository)
  })

  it('should fetch batlte field successfully', async () => {
    await Promise.all(
      Array.from({ length: 3 }).map((_, i) =>
        battleFieldRepository.create(
          makeBattleField({ name: `Battle field ${i + 1}` })
        )
      )
    )

    const result = await sut.execute({
      search: '',
      page: 1,
      limit: 10,
    })

    assert(result.isRight())
    expect(result.value.battleFields).toHaveLength(3)
  })

  it('should paginate traits correctly', async () => {
    await Promise.all(
      Array.from({ length: 5 }).map((_, i) =>
        battleFieldRepository.create(
          makeBattleField({ name: `Battle field ${i + 1}` })
        )
      )
    )

    const page1 = await sut.execute({
      search: '',
      page: 1,
      limit: 3,
    })
    const page2 = await sut.execute({
      search: '',
      page: 2,
      limit: 3,
    })

    assert(page1.isRight())
    expect(page1.value.battleFields).toHaveLength(3)

    assert(page2.isRight())
    expect(page2.value.battleFields).toHaveLength(2)
  })
})
