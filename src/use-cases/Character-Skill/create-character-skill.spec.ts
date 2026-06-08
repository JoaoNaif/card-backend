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

  it('should assign a skill to own character successfully', async () => {
    const userId = 'user-id-1'
    const skill = makeSkill()
    const character = makeCharacter({ userId })

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

  it('should return an error when character belongs to another user', async () => {
    const skill = makeSkill()
    const character = makeCharacter({ userId: 'owner-id' })

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

  it('should return an error when skill is not found', async () => {
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

  it('should return an error when character is not found', async () => {
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

  it('should return an error when character skill already exists', async () => {
    const userId = 'user-id-1'
    const skill = makeSkill()
    const character = makeCharacter({ userId })

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
})
