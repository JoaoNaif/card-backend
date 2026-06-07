import { describe, it, expect, beforeEach, assert } from 'vitest'
import { FetchCharacterUseCase } from './fetch-character'
import { InMemoryCharacterRepository } from '../../repositories/test/in-memory-character-repository'
import { makeCharacter } from '../../repositories/test/factories/make-character'

let characterRepository: InMemoryCharacterRepository
let sut: FetchCharacterUseCase

describe('FetchCharacterUseCase', () => {
  beforeEach(() => {
    characterRepository = new InMemoryCharacterRepository()
    sut = new FetchCharacterUseCase(characterRepository)
  })

  it('should fetch characters successfully', async () => {
    await Promise.all(
      Array.from({ length: 3 }).map((_, i) =>
        characterRepository.create(makeCharacter({ name: `Character ${i + 1}` }))
      )
    )

    const result = await sut.execute({ search: '', page: 1, limit: 10 })

    assert(result.isRight())
    expect(result.value.characters).toHaveLength(3)
  })

  it('should paginate characters correctly', async () => {
    await Promise.all(
      Array.from({ length: 5 }).map((_, i) =>
        characterRepository.create(makeCharacter({ name: `Character ${i + 1}` }))
      )
    )

    const page1 = await sut.execute({ search: '', page: 1, limit: 3 })
    const page2 = await sut.execute({ search: '', page: 2, limit: 3 })

    assert(page1.isRight())
    expect(page1.value.characters).toHaveLength(3)

    assert(page2.isRight())
    expect(page2.value.characters).toHaveLength(2)
  })
})
