import { describe, it, expect, beforeEach } from 'vitest'
import { InMemoryUserRepository } from '../../repositories/test/in-memory-user-repository'
import { InMemoryCharacterRepository } from '../../repositories/test/in-memory-character-repository'
import { InMemorySkillRepository } from '../../repositories/test/in-memory-skill-repository'
import { InMemoryCharacterSkillRepository } from '../../repositories/test/in-memory-character-skill-repository'
import { makeUser } from '../../repositories/test/factories/make-user'
import { makeCharacter } from '../../repositories/test/factories/make-character'
import { makeSkill } from '../../repositories/test/factories/make-skill'
import { makeCharacterSkill } from '../../repositories/test/factories/make-character-skill'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'
import { UnauthorizedError } from '../../core/error/err/unauthorized-error'
import { SkillNotFullError } from './err/skill-not-full-error'
import { SwapSkillUseCase } from './swap-skill'

let userRepository: InMemoryUserRepository
let characterRepository: InMemoryCharacterRepository
let skillRepository: InMemorySkillRepository
let characterSkillRepository: InMemoryCharacterSkillRepository
let sut: SwapSkillUseCase

describe('SwapSkillUseCase', () => {
  beforeEach(() => {
    userRepository = new InMemoryUserRepository()
    characterRepository = new InMemoryCharacterRepository()
    skillRepository = new InMemorySkillRepository()
    characterSkillRepository = new InMemoryCharacterSkillRepository()
    sut = new SwapSkillUseCase(
      characterRepository,
      userRepository,
      skillRepository,
      characterSkillRepository
    )
  })

  it('should swap a skill successfully', async () => {
    const user = makeUser()
    await userRepository.create(user)

    const character = makeCharacter({ userId: user.id.toString() })
    await characterRepository.create(character)

    const skills = Array.from({ length: 4 }, () =>
      makeSkill({ powerId: character.powerId })
    )
    for (const skill of skills) await skillRepository.create(skill)

    for (const skill of skills) {
      await characterSkillRepository.create(
        makeCharacterSkill({
          characterId: character.id.toString(),
          skillId: skill.id.toString(),
        })
      )
    }

    const newSkill = makeSkill({ powerId: character.powerId })
    await skillRepository.create(newSkill)

    const result = await sut.execute({
      userId: user.id.toString(),
      characterId: character.id.toString(),
      currentSkillId: skills[0]!.id.toString(),
      newSkillId: newSkill.id.toString(),
    })

    expect(result.isRight()).toBe(true)

    const updatedRoster = await characterSkillRepository.findAllByCharacterId(
      character.id.toString()
    )
    const rosterSkillIds = updatedRoster.map((cs) => cs.skillId)
    expect(rosterSkillIds).not.toContain(skills[0]!.id.toString())
    expect(rosterSkillIds).toContain(newSkill.id.toString())
  })

  it('should return SkillNotFullError when roster is not full', async () => {
    const user = makeUser()
    await userRepository.create(user)

    const character = makeCharacter({ userId: user.id.toString() })
    await characterRepository.create(character)

    const skill = makeSkill({ powerId: character.powerId })
    await skillRepository.create(skill)
    await characterSkillRepository.create(
      makeCharacterSkill({
        characterId: character.id.toString(),
        skillId: skill.id.toString(),
      })
    )

    const newSkill = makeSkill({ powerId: character.powerId })
    await skillRepository.create(newSkill)

    const result = await sut.execute({
      userId: user.id.toString(),
      characterId: character.id.toString(),
      currentSkillId: skill.id.toString(),
      newSkillId: newSkill.id.toString(),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(SkillNotFullError)
  })

  it('should return ResourceNotFoundError when currentSkill is not assigned to character', async () => {
    const user = makeUser()
    await userRepository.create(user)

    const character = makeCharacter({ userId: user.id.toString() })
    await characterRepository.create(character)

    const skills = Array.from({ length: 4 }, () =>
      makeSkill({ powerId: character.powerId })
    )
    for (const skill of skills) await skillRepository.create(skill)
    for (const skill of skills) {
      await characterSkillRepository.create(
        makeCharacterSkill({
          characterId: character.id.toString(),
          skillId: skill.id.toString(),
        })
      )
    }

    const unassignedSkill = makeSkill({ powerId: character.powerId })
    await skillRepository.create(unassignedSkill)

    const newSkill = makeSkill({ powerId: character.powerId })
    await skillRepository.create(newSkill)

    const result = await sut.execute({
      userId: user.id.toString(),
      characterId: character.id.toString(),
      currentSkillId: unassignedSkill.id.toString(),
      newSkillId: newSkill.id.toString(),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should return ResourceNotFoundError when newSkill does not exist', async () => {
    const user = makeUser()
    await userRepository.create(user)

    const character = makeCharacter({ userId: user.id.toString() })
    await characterRepository.create(character)

    const skills = Array.from({ length: 4 }, () =>
      makeSkill({ powerId: character.powerId })
    )
    for (const skill of skills) await skillRepository.create(skill)
    for (const skill of skills) {
      await characterSkillRepository.create(
        makeCharacterSkill({
          characterId: character.id.toString(),
          skillId: skill.id.toString(),
        })
      )
    }

    const result = await sut.execute({
      userId: user.id.toString(),
      characterId: character.id.toString(),
      currentSkillId: skills[0]!.id.toString(),
      newSkillId: 'non-existent-id',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should return UnauthorizedError when newSkill belongs to a different power', async () => {
    const user = makeUser()
    await userRepository.create(user)

    const character = makeCharacter({ userId: user.id.toString() })
    await characterRepository.create(character)

    const skills = Array.from({ length: 4 }, () =>
      makeSkill({ powerId: character.powerId })
    )
    for (const skill of skills) await skillRepository.create(skill)
    for (const skill of skills) {
      await characterSkillRepository.create(
        makeCharacterSkill({
          characterId: character.id.toString(),
          skillId: skill.id.toString(),
        })
      )
    }

    const wrongPowerSkill = makeSkill({ powerId: 'different-power-id' })
    await skillRepository.create(wrongPowerSkill)

    const result = await sut.execute({
      userId: user.id.toString(),
      characterId: character.id.toString(),
      currentSkillId: skills[0]!.id.toString(),
      newSkillId: wrongPowerSkill.id.toString(),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(UnauthorizedError)
  })

  it('should allow swap when newSkill belongs to secondaryPowerId', async () => {
    const user = makeUser()
    await userRepository.create(user)

    const secondaryPowerId = 'secondary-power-id'
    const character = makeCharacter({
      userId: user.id.toString(),
      secondaryPowerId,
    })
    await characterRepository.create(character)

    const skills = Array.from({ length: 4 }, () =>
      makeSkill({ powerId: character.powerId })
    )
    for (const skill of skills) await skillRepository.create(skill)
    for (const skill of skills) {
      await characterSkillRepository.create(
        makeCharacterSkill({
          characterId: character.id.toString(),
          skillId: skill.id.toString(),
        })
      )
    }

    const secondarySkill = makeSkill({ powerId: secondaryPowerId })
    await skillRepository.create(secondarySkill)

    const result = await sut.execute({
      userId: user.id.toString(),
      characterId: character.id.toString(),
      currentSkillId: skills[0]!.id.toString(),
      newSkillId: secondarySkill.id.toString(),
    })

    expect(result.isRight()).toBe(true)
  })

  it('should return UnauthorizedError when character does not belong to user', async () => {
    const user = makeUser()
    await userRepository.create(user)

    const character = makeCharacter()
    await characterRepository.create(character)

    const result = await sut.execute({
      userId: user.id.toString(),
      characterId: character.id.toString(),
      currentSkillId: 'any-id',
      newSkillId: 'any-id',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(UnauthorizedError)
  })

  it('should return ResourceNotFoundError when user does not exist', async () => {
    const character = makeCharacter()
    await characterRepository.create(character)

    const result = await sut.execute({
      userId: 'non-existent-id',
      characterId: character.id.toString(),
      currentSkillId: 'any-id',
      newSkillId: 'any-id',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should return ResourceNotFoundError when character does not exist', async () => {
    const user = makeUser()
    await userRepository.create(user)

    const result = await sut.execute({
      userId: user.id.toString(),
      characterId: 'non-existent-id',
      currentSkillId: 'any-id',
      newSkillId: 'any-id',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
