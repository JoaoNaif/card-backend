import { describe, it, expect, beforeEach, assert } from 'vitest'
import { InMemoryUserRepository } from '../../repositories/test/in-memory-user-repository'
import { InMemoryTraitRepository } from '../../repositories/test/in-memory-trait-repository'
import { makeUser } from '../../repositories/test/factories/make-user'
import { FetchTraitUseCase } from './fetch-trait'
import { makeTrait } from '../../repositories/test/factories/make-trait'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'

let userRepository: InMemoryUserRepository
let traitRepository: InMemoryTraitRepository
let sut: FetchTraitUseCase

describe('FetchTraitUseCase', () => {
  beforeEach(() => {
    userRepository = new InMemoryUserRepository()
    traitRepository = new InMemoryTraitRepository()
    sut = new FetchTraitUseCase(traitRepository, userRepository)
  })

  it('should fetch traits successfully', async () => {
    const user = makeUser()
    await userRepository.create(user)

    await Promise.all(
      Array.from({ length: 3 }).map((_, i) =>
        traitRepository.create(makeTrait({ name: `Trait ${i + 1}` }))
      )
    )

    const result = await sut.execute({
      userId: user.id.toString(),
      search: '',
      page: 1,
      limit: 10,
    })

    assert(result.isRight())
    expect(result.value.traits).toHaveLength(3)
  })

  it('should return an error when user is not found', async () => {
    const result = await sut.execute({
      userId: 'non-existing-user-id',
      search: '',
      page: 1,
      limit: 10,
    })

    assert(result.isLeft())
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should paginate traits correctly', async () => {
    const user = makeUser()
    await userRepository.create(user)

    await Promise.all(
      Array.from({ length: 5 }).map((_, i) =>
        traitRepository.create(makeTrait({ name: `Trait ${i + 1}` }))
      )
    )

    const page1 = await sut.execute({
      userId: user.id.toString(),
      search: '',
      page: 1,
      limit: 3,
    })
    const page2 = await sut.execute({
      userId: user.id.toString(),
      search: '',
      page: 2,
      limit: 3,
    })

    assert(page1.isRight())
    expect(page1.value.traits).toHaveLength(3)

    assert(page2.isRight())
    expect(page2.value.traits).toHaveLength(2)
  })
})
