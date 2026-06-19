import { describe, it, expect, beforeEach } from 'vitest'
import { InMemorySkillRepository } from '../../repositories/test/in-memory-skill-repository'
import { InMemoryCharacterRepository } from '../../repositories/test/in-memory-character-repository'
import { InMemoryCharacterSkillRepository } from '../../repositories/test/in-memory-character-skill-repository'
import { makeSkill } from '../../repositories/test/factories/make-skill'
import { makeCharacter } from '../../repositories/test/factories/make-character'
import { UnauthorizedError } from '../../core/error/err/unauthorized-error'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'
import { ResourceAlreadyExistError } from '../../core/error/err/resource-already-exist-error'
import { CreateCharacterSkillUseCase } from './create-character-skill'
import { SkillIncompatibleWithPowerError } from './err/skill-incompatible-with-power-error'
import { SlotSkillFullError } from './err/slot-skill-full-error'
import { MinLevelError } from './err/min-level-error'

let skillRepository: InMemorySkillRepository
let characterRepository: InMemoryCharacterRepository
let characterSkillRepository: InMemoryCharacterSkillRepository
let sut: CreateCharacterSkillUseCase

describe('CreateCharacterSkillUseCase', () => {
  beforeEach(() => {
    skillRepository = new InMemorySkillRepository()
    characterRepository = new InMemoryCharacterRepository()
    characterSkillRepository = new InMemoryCharacterSkillRepository()

    sut = new CreateCharacterSkillUseCase(
      characterSkillRepository,
      skillRepository,
      characterRepository
    )
  })

  it('should assign a skill compatible with primary power', async () => {
    const userId = 'user-id-1'
    const powerId = 'primary-power-id'
    const skill = makeSkill({ powerId, minLevel: 1 })
    const character = makeCharacter({ userId, powerId })

    await skillRepository.create(skill)
    await characterRepository.create(character)

    const result = await sut.execute({
      userId,
      characterId: character.id.toString(),
      skillId: skill.id.toString(),
      assignedAt: new Date(),
    })

    expect(result.isRight()).toBe(true)
    expect(characterSkillRepository.items).toHaveLength(1)

    if (result.isRight()) {
      expect(result.value.characterSkill.characterId).toBe(character.id.toString())
      expect(result.value.characterSkill.skillId).toBe(skill.id.toString())
    }
  })

  it('should assign a skill compatible with secondary power', async () => {
    const userId = 'user-id-1'
    const secondaryPowerId = 'secondary-power-id'
    const skill = makeSkill({ powerId: secondaryPowerId, minLevel: 1 })
    const character = makeCharacter({ userId, secondaryPowerId })

    await skillRepository.create(skill)
    await characterRepository.create(character)

    const result = await sut.execute({
      userId,
      characterId: character.id.toString(),
      skillId: skill.id.toString(),
      assignedAt: new Date(),
    })

    expect(result.isRight()).toBe(true)
  })

  it('should assign a skill compatible with awakened power', async () => {
    const userId = 'user-id-1'
    const awakenedPowerId = 'awakened-power-id'
    const skill = makeSkill({ powerId: awakenedPowerId, minLevel: 1 })
    const character = makeCharacter({ userId, awakenedPowerId })

    await skillRepository.create(skill)
    await characterRepository.create(character)

    const result = await sut.execute({
      userId,
      characterId: character.id.toString(),
      skillId: skill.id.toString(),
      assignedAt: new Date(),
    })

    expect(result.isRight()).toBe(true)
  })

  it('should return error when skill power does not match any character power', async () => {
    const userId = 'user-id-1'
    const skill = makeSkill({ powerId: 'unrelated-power-id' })
    const character = makeCharacter({ userId, powerId: 'character-power-id' })

    await skillRepository.create(skill)
    await characterRepository.create(character)

    const result = await sut.execute({
      userId,
      characterId: character.id.toString(),
      skillId: skill.id.toString(),
      assignedAt: new Date(),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(SkillIncompatibleWithPowerError)
  })

  it('should return error when character belongs to another user', async () => {
    const powerId = 'power-id'
    const skill = makeSkill({ powerId })
    const character = makeCharacter({ userId: 'owner-id', powerId })

    await skillRepository.create(skill)
    await characterRepository.create(character)

    const result = await sut.execute({
      userId: 'other-user-id',
      characterId: character.id.toString(),
      skillId: skill.id.toString(),
      assignedAt: new Date(),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(UnauthorizedError)
  })

  it('should return error when skill is not found', async () => {
    const userId = 'user-id-1'
    const character = makeCharacter({ userId })

    await characterRepository.create(character)

    const result = await sut.execute({
      userId,
      characterId: character.id.toString(),
      skillId: 'non-existing-skill-id',
      assignedAt: new Date(),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should return error when character is not found', async () => {
    const skill = makeSkill()

    await skillRepository.create(skill)

    const result = await sut.execute({
      userId: 'user-id-1',
      characterId: 'non-existing-character-id',
      skillId: skill.id.toString(),
      assignedAt: new Date(),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should return error when character skill already exists', async () => {
    const userId = 'user-id-1'
    const powerId = 'power-id'
    const skill = makeSkill({ powerId, minLevel: 1 })
    const character = makeCharacter({ userId, powerId })

    await skillRepository.create(skill)
    await characterRepository.create(character)

    await sut.execute({
      userId,
      characterId: character.id.toString(),
      skillId: skill.id.toString(),
      assignedAt: new Date(),
    })

    const result = await sut.execute({
      userId,
      characterId: character.id.toString(),
      skillId: skill.id.toString(),
      assignedAt: new Date(),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceAlreadyExistError)
  })

  it('should return error when character already has 4 skills', async () => {
    const userId = 'user-id-1'
    const powerId = 'power-id'
    const character = makeCharacter({ userId, powerId, level: 99 })

    await characterRepository.create(character)

    for (let i = 0; i < 4; i++) {
      const skill = makeSkill({ powerId, minLevel: 1 })
      await skillRepository.create(skill)
      await sut.execute({
        userId,
        characterId: character.id.toString(),
        skillId: skill.id.toString(),
        assignedAt: new Date(),
      })
    }

    const extraSkill = makeSkill({ powerId, minLevel: 1 })
    await skillRepository.create(extraSkill)

    const result = await sut.execute({
      userId,
      characterId: character.id.toString(),
      skillId: extraSkill.id.toString(),
      assignedAt: new Date(),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(SlotSkillFullError)
  })

  it('should return error when character level is below skill minLevel', async () => {
    const userId = 'user-id-1'
    const powerId = 'power-id'
    const skill = makeSkill({ powerId, minLevel: 50 })
    const character = makeCharacter({ userId, powerId, level: 10 })

    await skillRepository.create(skill)
    await characterRepository.create(character)

    const result = await sut.execute({
      userId,
      characterId: character.id.toString(),
      skillId: skill.id.toString(),
      assignedAt: new Date(),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(MinLevelError)
  })
})
