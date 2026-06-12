import { describe, it, expect, beforeEach } from 'vitest'
import { InMemoryCharacterRepository } from '../../repositories/test/in-memory-character-repository'
import { makeCharacter } from '../../repositories/test/factories/make-character'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'
import { Ranking } from '../../entities/character'
import { GainXpUseCase } from './gain-xp'

let characterRepository: InMemoryCharacterRepository
let sut: GainXpUseCase

describe('GainXpUseCase', () => {
  beforeEach(() => {
    characterRepository = new InMemoryCharacterRepository()
    sut = new GainXpUseCase(characterRepository)
  })

  it('should gain xp without leveling up', async () => {
    const character = makeCharacter({ level: 1, xp: 0 })
    await characterRepository.create(character)

    const result = await sut.execute({
      characterId: character.id.toString(),
      xpAmount: 50,
    })

    expect(result.isRight()).toBe(true)
    expect(result.value).toEqual({ levelsGained: 0, newLevel: 1 })
    expect(characterRepository.items[0]?.xp).toBe(50)
  })

  it('should level up when xp reaches the threshold', async () => {
    const character = makeCharacter({ level: 1, xp: 0 })
    await characterRepository.create(character)

    // nível 1 precisa de 100 xp
    const result = await sut.execute({
      characterId: character.id.toString(),
      xpAmount: 100,
    })

    expect(result.isRight()).toBe(true)
    expect(result.value).toEqual({ levelsGained: 1, newLevel: 2 })
    expect(characterRepository.items[0]?.xp).toBe(0)
  })

  it('should level up multiple times when xp overflows', async () => {
    const character = makeCharacter({ level: 1, xp: 0 })
    await characterRepository.create(character)

    // nível 1 → 100 xp, nível 2 → 200 xp, nível 3 → 300 xp = 600 total
    const result = await sut.execute({
      characterId: character.id.toString(),
      xpAmount: 600,
    })

    expect(result.isRight()).toBe(true)
    expect(result.value).toEqual({ levelsGained: 3, newLevel: 4 })
    expect(characterRepository.items[0]?.xp).toBe(0)
  })

  it('should carry over leftover xp after leveling up', async () => {
    const character = makeCharacter({ level: 1, xp: 0 })
    await characterRepository.create(character)

    // 150 xp: sobe para nível 2 (custo 100), sobra 50
    const result = await sut.execute({
      characterId: character.id.toString(),
      xpAmount: 150,
    })

    expect(result.isRight()).toBe(true)
    expect(result.value).toEqual({ levelsGained: 1, newLevel: 2 })
    expect(characterRepository.items[0]?.xp).toBe(50)
  })

  it('should cap at maxLevel and discard excess xp', async () => {
    // MORTAL tem teto 20, coloca no nível 19 para subir ao teto
    const character = makeCharacter({ ranking: Ranking.MORTAL, level: 19, xp: 0 })
    await characterRepository.create(character)

    // nível 19 precisa de 1900 xp — envia bem mais
    const result = await sut.execute({
      characterId: character.id.toString(),
      xpAmount: 9999,
    })

    expect(result.isRight()).toBe(true)
    expect(result.value).toEqual({ levelsGained: 1, newLevel: 20 })
    expect(characterRepository.items[0]?.xp).toBe(0)
  })

  it('should not gain levels when already at maxLevel', async () => {
    const character = makeCharacter({ ranking: Ranking.MORTAL, level: 20, xp: 0 })
    await characterRepository.create(character)

    const result = await sut.execute({
      characterId: character.id.toString(),
      xpAmount: 9999,
    })

    expect(result.isRight()).toBe(true)
    expect(result.value).toEqual({ levelsGained: 0, newLevel: 20 })
    expect(characterRepository.items[0]?.xp).toBe(0)
  })

  it('should return NotFoundError when character does not exist', async () => {
    const result = await sut.execute({
      characterId: 'non-existent-id',
      xpAmount: 100,
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})