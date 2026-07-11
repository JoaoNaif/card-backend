import { describe, it, expect, beforeEach } from 'vitest'
import { InMemoryCharacterRepository } from '../../repositories/test/in-memory-character-repository'
import { InMemoryPowerRepository } from '../../repositories/test/in-memory-power-repository'
import { InMemoryCharacterSkillRepository } from '../../repositories/test/in-memory-character-skill-repository'
import { InMemorySkillRepository } from '../../repositories/test/in-memory-skill-repository'
import { InMemoryBattleFieldRepository } from '../../repositories/test/in-memory-battle-field-repository'
import { makeCharacter } from '../../repositories/test/factories/make-character'
import { makePower } from '../../repositories/test/factories/make-power'
import { makeSkill } from '../../repositories/test/factories/make-skill'
import { makeCharacterSkill } from '../../repositories/test/factories/make-character-skill'
import { makeBattleField } from '../../repositories/test/factories/make-battle-field'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'
import { GetCharacterUseCase } from './get-character'

let characterRepository: InMemoryCharacterRepository
let powerRepository: InMemoryPowerRepository
let characterSkillRepository: InMemoryCharacterSkillRepository
let skillRepository: InMemorySkillRepository
let battleFieldRepository: InMemoryBattleFieldRepository
let sut: GetCharacterUseCase

describe('GetCharacterUseCase', () => {
  beforeEach(() => {
    characterRepository = new InMemoryCharacterRepository()
    powerRepository = new InMemoryPowerRepository()
    characterSkillRepository = new InMemoryCharacterSkillRepository()
    skillRepository = new InMemorySkillRepository()
    battleFieldRepository = new InMemoryBattleFieldRepository()
    sut = new GetCharacterUseCase(
      characterRepository,
      powerRepository,
      characterSkillRepository,
      skillRepository,
      battleFieldRepository
    )
  })

  async function setup() {
    const power = makePower()
    await powerRepository.create(power)

    const character = makeCharacter({ powerId: power.id.toString() })
    await characterRepository.create(character)

    return { power, character }
  }

  it('should return character with power and empty skills list', async () => {
    const { character, power } = await setup()

    const result = await sut.execute({ characterId: character.id.toString() })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.character.id).toBe(character.id.toString())
      expect(result.value.character.name).toBe(character.name)
      expect(result.value.character.power.id).toBe(power.id.toString())
      expect(result.value.character.skills).toEqual([])
    }
  })

  it('should return character with skills', async () => {
    const { character, power } = await setup()

    const skill = makeSkill({ powerId: power.id.toString() })
    await skillRepository.create(skill)

    const characterSkill = makeCharacterSkill({
      characterId: character.id.toString(),
      skillId: skill.id.toString(),
    })
    await characterSkillRepository.create(characterSkill)

    const result = await sut.execute({ characterId: character.id.toString() })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      const skills = result.value.character.skills
      expect(skills).toHaveLength(1)
      expect(skills[0]?.id).toBe(skill.id.toString())
      expect(skills[0]?.name).toBe(skill.name)
      expect(skills[0]?.power.id).toBe(power.id.toString())
      expect(skills[0]?.battleField).toBeNull()
    }
  })

  it('should return character with skill battle field when present', async () => {
    const { character, power } = await setup()

    const battleField = makeBattleField({ name: 'Lagoa azul' })
    await battleFieldRepository.create(battleField)

    const skill = makeSkill({
      powerId: power.id.toString(),
      appliesBattleFieldId: battleField.id.toString(),
      fieldDuration: 3,
    })
    await skillRepository.create(skill)

    const characterSkill = makeCharacterSkill({
      characterId: character.id.toString(),
      skillId: skill.id.toString(),
    })
    await characterSkillRepository.create(characterSkill)

    const result = await sut.execute({ characterId: character.id.toString() })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      const skills = result.value.character.skills
      expect(skills[0]?.battleField?.name).toBe('Lagoa azul')
      expect(skills[0]?.fieldDuration).toBe(3)
    }
  })

  it('should return character with secondary power when present', async () => {
    const power = makePower()
    await powerRepository.create(power)

    const secondaryPower = makePower()
    await powerRepository.create(secondaryPower)

    const character = makeCharacter({
      powerId: power.id.toString(),
      secondaryPowerId: secondaryPower.id.toString(),
    })
    await characterRepository.create(character)

    const result = await sut.execute({ characterId: character.id.toString() })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.character.secondaryPower?.id).toBe(secondaryPower.id.toString())
    }
  })

  it('should return character with awakened power when present', async () => {
    const power = makePower()
    await powerRepository.create(power)

    const awakenedPower = makePower({ isAwakened: true })
    await powerRepository.create(awakenedPower)

    const character = makeCharacter({
      powerId: power.id.toString(),
      awakenedPowerId: awakenedPower.id.toString(),
    })
    await characterRepository.create(character)

    const result = await sut.execute({ characterId: character.id.toString() })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.character.awakenedPower?.id).toBe(awakenedPower.id.toString())
    }
  })

  it('should return ResourceNotFoundError when character does not exist', async () => {
    const result = await sut.execute({ characterId: 'non-existent-id' })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should return ResourceNotFoundError when power does not exist', async () => {
    const character = makeCharacter({ powerId: 'non-existent-power-id' })
    await characterRepository.create(character)

    const result = await sut.execute({ characterId: character.id.toString() })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
