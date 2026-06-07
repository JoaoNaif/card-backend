import { describe, it, expect, beforeEach } from 'vitest'
import { FetchCharacterUseCase } from './fetch-character'
import { InMemoryCharacterRepository } from '../../repositories/test/in-memory-character-repository'
import { InMemoryPowerRepository } from '../../repositories/test/in-memory-power-repository'
import { InMemoryUserRepository } from '../../repositories/test/in-memory-user-repository'
import { makeCharacter } from '../../repositories/test/factories/make-character'
import { makePower } from '../../repositories/test/factories/make-power'
import { makeUser } from '../../repositories/test/factories/make-user'

let characterRepository: InMemoryCharacterRepository
let powerRepository: InMemoryPowerRepository
let userRepository: InMemoryUserRepository
let sut: FetchCharacterUseCase

describe('FetchCharacterUseCase', () => {
  beforeEach(() => {
    characterRepository = new InMemoryCharacterRepository()
    powerRepository = new InMemoryPowerRepository()
    userRepository = new InMemoryUserRepository()
    sut = new FetchCharacterUseCase(characterRepository, powerRepository, userRepository)
  })

  it('should fetch characters successfully', async () => {
    const user = makeUser()
    await userRepository.create(user)

    await Promise.all(
      Array.from({ length: 3 }).map(async (_, i) => {
        const power = makePower({ name: `Power ${i + 1}` })
        await powerRepository.create(power)
        await characterRepository.create(
          makeCharacter({
            name: `Character ${i + 1}`,
            powerId: power.id.toString(),
            userId: user.id.toString(),
          })
        )
      })
    )

    const result = await sut.execute({ search: '', page: 1, limit: 10 })

    expect(result.characters.characters).toHaveLength(3)
  })

  it('should paginate characters correctly', async () => {
    const user = makeUser()
    await userRepository.create(user)

    await Promise.all(
      Array.from({ length: 5 }).map(async (_, i) => {
        const power = makePower({ name: `Power ${i + 1}` })
        await powerRepository.create(power)
        await characterRepository.create(
          makeCharacter({
            name: `Character ${i + 1}`,
            powerId: power.id.toString(),
            userId: user.id.toString(),
          })
        )
      })
    )

    const page1 = await sut.execute({ search: '', page: 1, limit: 3 })
    const page2 = await sut.execute({ search: '', page: 2, limit: 3 })

    expect(page1.characters.characters).toHaveLength(3)
    expect(page2.characters.characters).toHaveLength(2)
  })
})
