import { describe, it, expect, beforeEach } from 'vitest'
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

  it('should fetch a trait successfully', async () => {
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
      limit: 10,
      page: 1,
    })

    expect(result.isRight()).toBe(true)
    expect(traitRepository.items).toHaveLength(3)
  })

  it('should return an error when user is not found', async () => {
    const user = makeUser()

    await userRepository.create(user)

    await Promise.all(
      Array.from({ length: 3 }).map((_, i) =>
        traitRepository.create(makeTrait({ name: `Trait ${i + 1}` }))
      )
    )

    const result = await sut.execute({
      userId: 'non-existing-user-id',
      search: '',
      limit: 10,
      page: 1,
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
