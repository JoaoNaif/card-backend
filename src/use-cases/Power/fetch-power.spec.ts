import { describe, it, expect, beforeEach, assert } from 'vitest'
import { FetchPowerUseCase } from './fetch-power'
import { InMemoryPowerRepository } from '../../repositories/test/in-memory-power-repository'
import { makePower } from '../../repositories/test/factories/make-power'

let powerRepository: InMemoryPowerRepository
let sut: FetchPowerUseCase

describe('FetchPowerUseCase', () => {
  beforeEach(() => {
    powerRepository = new InMemoryPowerRepository()
    sut = new FetchPowerUseCase(powerRepository)
  })

  it('should fetch powers successfully', async () => {
    await Promise.all(
      Array.from({ length: 3 }).map((_, i) =>
        powerRepository.create(makePower({ name: `Power ${i + 1}` }))
      )
    )

    const result = await sut.execute({ search: '', page: 1, limit: 10 })

    assert(result.isRight())
    expect(result.value.powers).toHaveLength(3)
  })

  it('should paginate powers correctly', async () => {
    await Promise.all(
      Array.from({ length: 5 }).map((_, i) =>
        powerRepository.create(makePower({ name: `Power ${i + 1}` }))
      )
    )

    const page1 = await sut.execute({ search: '', page: 1, limit: 3 })
    const page2 = await sut.execute({ search: '', page: 2, limit: 3 })

    assert(page1.isRight())
    expect(page1.value.powers).toHaveLength(3)

    assert(page2.isRight())
    expect(page2.value.powers).toHaveLength(2)
  })
})
