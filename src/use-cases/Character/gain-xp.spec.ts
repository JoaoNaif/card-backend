import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { InMemoryCharacterRepository } from '../../repositories/test/in-memory-character-repository'
import { InMemoryPowerRepository } from '../../repositories/test/in-memory-power-repository'
import { InMemoryPowerAwakeningRepository } from '../../repositories/test/in-memory-power-awakening-repository'
import { makeCharacter } from '../../repositories/test/factories/make-character'
import { makePower } from '../../repositories/test/factories/make-power'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'
import { Ranking } from '../../entities/character'
import { PowerAwakening } from '../../entities/power-awakening'
import { GainXpUseCase } from './gain-xp'

let characterRepository: InMemoryCharacterRepository
let powerRepository: InMemoryPowerRepository
let powerAwakeningRepository: InMemoryPowerAwakeningRepository
let sut: GainXpUseCase

describe('GainXpUseCase', () => {
  beforeEach(() => {
    characterRepository = new InMemoryCharacterRepository()
    powerRepository = new InMemoryPowerRepository()
    powerAwakeningRepository = new InMemoryPowerAwakeningRepository()
    sut = new GainXpUseCase(characterRepository, powerRepository, powerAwakeningRepository)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  async function setup(
    characterOverride: Parameters<typeof makeCharacter>[0] = {},
    powerOverride: Parameters<typeof makePower>[0] = {}
  ) {
    const power = makePower(powerOverride)
    await powerRepository.create(power)
    const character = makeCharacter({ powerId: power.id.toString(), ...characterOverride })
    await characterRepository.create(character)
    return { power, character }
  }

  it('should gain xp without leveling up', async () => {
    const { character } = await setup({ level: 1, xp: 0 })

    const result = await sut.execute({ characterId: character.id.toString(), xpAmount: 50 })

    expect(result.isRight()).toBe(true)
    expect(result.value).toEqual({ levelsGained: 0, newLevel: 1, awakened: false, pendingSkillSelections: 0 })
    expect(characterRepository.items[0]?.xp).toBe(50)
  })

  it('should level up when xp reaches the threshold', async () => {
    const { character } = await setup({ level: 1, xp: 0 })

    // nível 1 precisa de 100 xp
    const result = await sut.execute({ characterId: character.id.toString(), xpAmount: 100 })

    expect(result.isRight()).toBe(true)
    expect(result.value).toEqual({ levelsGained: 1, newLevel: 2, awakened: false, pendingSkillSelections: 0 })
    expect(characterRepository.items[0]?.xp).toBe(0)
  })

  it('should level up multiple times when xp overflows', async () => {
    const { character } = await setup({ level: 1, xp: 0 })

    // nível 1 → 100 xp, nível 2 → 200 xp, nível 3 → 300 xp = 600 total
    const result = await sut.execute({ characterId: character.id.toString(), xpAmount: 600 })

    expect(result.isRight()).toBe(true)
    expect(result.value).toEqual({ levelsGained: 3, newLevel: 4, awakened: false, pendingSkillSelections: 0 })
    expect(characterRepository.items[0]?.xp).toBe(0)
  })

  it('should carry over leftover xp after leveling up', async () => {
    const { character } = await setup({ level: 1, xp: 0 })

    // 150 xp: sobe para nível 2 (custo 100), sobra 50
    const result = await sut.execute({ characterId: character.id.toString(), xpAmount: 150 })

    expect(result.isRight()).toBe(true)
    expect(result.value).toEqual({ levelsGained: 1, newLevel: 2, awakened: false, pendingSkillSelections: 0 })
    expect(characterRepository.items[0]?.xp).toBe(50)
  })

  it('should cap at maxLevel and discard excess xp', async () => {
    const { character } = await setup({ ranking: Ranking.DISCRETO, level: 19, xp: 0 })

    // nível 19 precisa de 1900 xp — envia bem mais
    const result = await sut.execute({ characterId: character.id.toString(), xpAmount: 9999 })

    expect(result.isRight()).toBe(true)
    expect(result.value).toEqual({ levelsGained: 1, newLevel: 20, awakened: false, pendingSkillSelections: 1 })
    expect(characterRepository.items[0]?.xp).toBe(0)
  })

  it('should not gain levels when already at maxLevel', async () => {
    const { character } = await setup({ ranking: Ranking.DISCRETO, level: 20, xp: 0 })

    const result = await sut.execute({ characterId: character.id.toString(), xpAmount: 9999 })

    expect(result.isRight()).toBe(true)
    expect(result.value).toEqual({ levelsGained: 0, newLevel: 20, awakened: false, pendingSkillSelections: 0 })
    expect(characterRepository.items[0]?.xp).toBe(0)
  })

  it('should return NotFoundError when character does not exist', async () => {
    const result = await sut.execute({ characterId: 'non-existent-id', xpAmount: 100 })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  describe('awakening', () => {
    it('should awaken when crossing a trigger level with canAwaken power', async () => {
      const magmaPower = makePower({ name: 'Magma', isAwakened: true })
      await powerRepository.create(magmaPower)

      const { power, character } = await setup(
        { ranking: Ranking.CONTINUO, level: 19, xp: 0 },
        { canAwaken: true }
      )

      await powerAwakeningRepository.create(
        PowerAwakening.create({
          basePowerId: power.id.toString(),
          awakenedPowerId: magmaPower.id.toString(),
        })
      )

      vi.spyOn(Math, 'random').mockReturnValue(0.05)

      // nível 19 → 20 (trigger): custo 19 * 100 = 1900 xp
      const result = await sut.execute({ characterId: character.id.toString(), xpAmount: 1900 })

      expect(result.isRight()).toBe(true)
      if (result.isRight()) {
        expect(result.value.awakened).toBe(true)
        expect(result.value.awakenedPowerName).toBe('Magma')
      }
      expect(characterRepository.items[0]?.awakenedPowerId).toBe(magmaPower.id.toString())
    })

    it('should not awaken when random is above AWAKEN_CHANCE', async () => {
      const magmaPower = makePower({ name: 'Magma', isAwakened: true })
      await powerRepository.create(magmaPower)

      const { power, character } = await setup(
        { ranking: Ranking.CONTINUO, level: 19, xp: 0 },
        { canAwaken: true }
      )

      await powerAwakeningRepository.create(
        PowerAwakening.create({
          basePowerId: power.id.toString(),
          awakenedPowerId: magmaPower.id.toString(),
        })
      )

      vi.spyOn(Math, 'random').mockReturnValue(0.5)

      const result = await sut.execute({ characterId: character.id.toString(), xpAmount: 1900 })

      expect(result.isRight()).toBe(true)
      if (result.isRight()) {
        expect(result.value.awakened).toBe(false)
        expect(result.value.awakenedPowerName).toBeUndefined()
      }
    })

    it('should not awaken when power.canAwaken is false', async () => {
      const { character } = await setup(
        { ranking: Ranking.CONTINUO, level: 19, xp: 0 },
        { canAwaken: false }
      )

      vi.spyOn(Math, 'random').mockReturnValue(0.01)

      const result = await sut.execute({ characterId: character.id.toString(), xpAmount: 1900 })

      expect(result.isRight()).toBe(true)
      if (result.isRight()) {
        expect(result.value.awakened).toBe(false)
      }
    })

    it('should not awaken when character has dual power', async () => {
      const secondaryPower = makePower({ name: 'Secondary' })
      await powerRepository.create(secondaryPower)

      const magmaPower = makePower({ name: 'Magma', isAwakened: true })
      await powerRepository.create(magmaPower)

      const { power, character } = await setup(
        {
          ranking: Ranking.CONTINUO,
          level: 19,
          xp: 0,
          secondaryPowerId: secondaryPower.id.toString(),
        },
        { canAwaken: true }
      )

      await powerAwakeningRepository.create(
        PowerAwakening.create({
          basePowerId: power.id.toString(),
          awakenedPowerId: magmaPower.id.toString(),
        })
      )

      vi.spyOn(Math, 'random').mockReturnValue(0.01)

      const result = await sut.execute({ characterId: character.id.toString(), xpAmount: 1900 })

      expect(result.isRight()).toBe(true)
      if (result.isRight()) {
        expect(result.value.awakened).toBe(false)
      }
    })

    it('should not awaken when character is already awakened', async () => {
      const magmaPower = makePower({ name: 'Magma', isAwakened: true })
      await powerRepository.create(magmaPower)

      const { power, character } = await setup(
        {
          ranking: Ranking.CONTINUO,
          level: 19,
          xp: 0,
          awakenedPowerId: magmaPower.id.toString(),
        },
        { canAwaken: true }
      )

      await powerAwakeningRepository.create(
        PowerAwakening.create({
          basePowerId: power.id.toString(),
          awakenedPowerId: magmaPower.id.toString(),
        })
      )

      vi.spyOn(Math, 'random').mockReturnValue(0.01)

      const result = await sut.execute({ characterId: character.id.toString(), xpAmount: 1900 })

      expect(result.isRight()).toBe(true)
      if (result.isRight()) {
        expect(result.value.awakened).toBe(false)
      }
    })

    it('should not awaken when level-up does not cross a trigger level', async () => {
      const magmaPower = makePower({ name: 'Magma', isAwakened: true })
      await powerRepository.create(magmaPower)

      const { power, character } = await setup(
        { ranking: Ranking.CONTINUO, level: 1, xp: 0 },
        { canAwaken: true }
      )

      await powerAwakeningRepository.create(
        PowerAwakening.create({
          basePowerId: power.id.toString(),
          awakenedPowerId: magmaPower.id.toString(),
        })
      )

      vi.spyOn(Math, 'random').mockReturnValue(0.01)

      // nível 1 → 2, não cruza nenhum trigger (mínimo é 20)
      const result = await sut.execute({ characterId: character.id.toString(), xpAmount: 100 })

      expect(result.isRight()).toBe(true)
      if (result.isRight()) {
        expect(result.value.awakened).toBe(false)
      }
    })

    it('should awaken only once even when crossing multiple trigger levels', async () => {
      const magmaPower = makePower({ name: 'Magma', isAwakened: true })
      await powerRepository.create(magmaPower)

      const { power, character } = await setup(
        { ranking: Ranking.CONTINUO, level: 19, xp: 0 },
        { canAwaken: true }
      )

      await powerAwakeningRepository.create(
        PowerAwakening.create({
          basePowerId: power.id.toString(),
          awakenedPowerId: magmaPower.id.toString(),
        })
      )

      vi.spyOn(Math, 'random').mockReturnValue(0.05)

      // nível 19 → 25, cruza triggers em 20 e 25
      // custo: 1900+2000+2100+2200+2300+2400 = 12900 xp
      const result = await sut.execute({ characterId: character.id.toString(), xpAmount: 12900 })

      expect(result.isRight()).toBe(true)
      if (result.isRight()) {
        expect(result.value.awakened).toBe(true)
      }
      // deve ter um único awakenedPowerId, não sobrescrito
      expect(characterRepository.items[0]?.awakenedPowerId).toBe(magmaPower.id.toString())
    })
  })
})
