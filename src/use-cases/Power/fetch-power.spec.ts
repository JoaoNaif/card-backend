import { describe, it, expect, beforeEach } from 'vitest'
import { InMemoryTraitRepository } from '../../repositories/test/in-memory-trait-repository'
import { FetchPowerUseCase } from './fetch-power'
import type { InMemoryPowerRepository } from '../../repositories/test/in-memory-power-repository'
import { makePower } from '../../repositories/test/factories/make-power'

let powerRepository: InMemoryPowerRepository
let sut: FetchPowerUseCase

describe('FetchPowerUseCase', () => {
  beforeEach(() => {
    powerRepository = new InMemoryTraitRepository()
    sut = new FetchPowerUseCase(powerRepository)
  })

  it('should fetch a power successfully', async () => {
    await Promise.all(
      Array.from({ length: 3 }).map((_, i) =>
        powerRepository.create(makePower({ name: `Power ${i + 1}` }))
      )
    )

    const result = await sut.execute({
      search: '',
      limit: 10,
      page: 1,
    })

    expect(result.isRight()).toBe(true)
    expect(powerRepository.items).toHaveLength(3)
  })
})
