import { describe, it, expect, beforeEach } from 'vitest'
import { InMemoryUserRepository } from '../../repositories/test/in-memory-user-repository'
import { makeUser } from '../../repositories/test/factories/make-user'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'
import { ResourceAlreadyExistError } from '../../core/error/err/resource-already-exist-error'
import { UnauthorizedError } from '../../core/error/err/unauthorized-error'
import { InMemoryCharacterRepository } from '../../repositories/test/in-memory-character-repository'
import { makeCharacter } from '../../repositories/test/factories/make-character'
import { InMemorySkillRepository } from '../../repositories/test/in-memory-skill-repository'
import { InMemoryCharacterSkillRepository } from '../../repositories/test/in-memory-character-skill-repository'
import { InMemoryPendingSkillChoiceRepository } from '../../repositories/test/in-memory-pending-skill-choice-repository'
import { makeCharacterSkill } from '../../repositories/test/factories/make-character-skill'
import { makeSkill } from '../../repositories/test/factories/make-skill'
import { makePendingSkillChoice } from '../../repositories/test/factories/make-pending-skill-choice'
import { ResolveSkillOptionUseCase } from './resolve-skill-option'
import { UnavailabelSkillOptionsError } from './err/unavailable-skills-options-error'
import { InvalidSkillOptionError } from './err/invalid-skill-option-error'
import { SkillSwapTargetRequiredError } from './err/skill-swap-target-required-error'

let userRepository: InMemoryUserRepository
let characterRepository: InMemoryCharacterRepository
let skillRepository: InMemorySkillRepository
let characterSkillRepository: InMemoryCharacterSkillRepository
let pendingSkillChoiceRepository: InMemoryPendingSkillChoiceRepository
let sut: ResolveSkillOptionUseCase

describe('ResolveSkillOptionUseCase', () => {
  beforeEach(() => {
    userRepository = new InMemoryUserRepository()
    characterRepository = new InMemoryCharacterRepository()
    skillRepository = new InMemorySkillRepository()
    characterSkillRepository = new InMemoryCharacterSkillRepository()
    pendingSkillChoiceRepository = new InMemoryPendingSkillChoiceRepository()
    sut = new ResolveSkillOptionUseCase(
      characterRepository,
      userRepository,
      skillRepository,
      characterSkillRepository,
      pendingSkillChoiceRepository
    )
  })

  it('should assign the chosen skill and resolve the pending choice', async () => {
    const user = makeUser()
    await userRepository.create(user)

    const character = makeCharacter({
      userId: user.id.toString(),
      pendingSkillSelections: 1,
    })
    await characterRepository.create(character)

    const skill = makeSkill({ powerId: character.powerId })
    await skillRepository.create(skill)

    const otherSkill = makeSkill({ powerId: character.powerId })
    await skillRepository.create(otherSkill)

    const pending = makePendingSkillChoice({
      characterId: character.id.toString(),
      optionSkillIds: [skill.id.toString(), otherSkill.id.toString()],
    })
    await pendingSkillChoiceRepository.create(pending)

    const result = await sut.execute({
      userId: user.id.toString(),
      characterId: character.id.toString(),
      skillId: skill.id.toString(),
    })

    expect(result.isRight()).toBe(true)

    const roster = await characterSkillRepository.findAllByCharacterId(
      character.id.toString()
    )
    expect(roster.map((cs) => cs.skillId)).toEqual([skill.id.toString()])

    const openPending = await pendingSkillChoiceRepository.findOpenByCharacterId(
      character.id.toString()
    )
    expect(openPending).toBeNull()

    const savedCharacter = await characterRepository.findById(
      character.id.toString()
    )
    expect(savedCharacter?.pendingSkillSelections).toBe(0)
  })

  it('should return InvalidSkillOptionError when skill is not one of the offered options', async () => {
    const user = makeUser()
    await userRepository.create(user)

    const character = makeCharacter({
      userId: user.id.toString(),
      pendingSkillSelections: 1,
    })
    await characterRepository.create(character)

    const offeredSkill = makeSkill({ powerId: character.powerId })
    await skillRepository.create(offeredSkill)

    const otherSkill = makeSkill({ powerId: character.powerId })
    await skillRepository.create(otherSkill)

    await pendingSkillChoiceRepository.create(
      makePendingSkillChoice({
        characterId: character.id.toString(),
        optionSkillIds: [offeredSkill.id.toString()],
      })
    )

    const result = await sut.execute({
      userId: user.id.toString(),
      characterId: character.id.toString(),
      skillId: otherSkill.id.toString(),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(InvalidSkillOptionError)
  })

  it('should return UnavailabelSkillOptionsError when there is no open pending choice', async () => {
    const user = makeUser()
    await userRepository.create(user)

    const character = makeCharacter({
      userId: user.id.toString(),
      pendingSkillSelections: 0,
    })
    await characterRepository.create(character)

    const skill = makeSkill({ powerId: character.powerId })
    await skillRepository.create(skill)

    const result = await sut.execute({
      userId: user.id.toString(),
      characterId: character.id.toString(),
      skillId: skill.id.toString(),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(UnavailabelSkillOptionsError)
  })

  it('should return ResourceAlreadyExistError when skill is already assigned', async () => {
    const user = makeUser()
    await userRepository.create(user)

    const character = makeCharacter({
      userId: user.id.toString(),
      pendingSkillSelections: 1,
    })
    await characterRepository.create(character)

    const skill = makeSkill({ powerId: character.powerId })
    await skillRepository.create(skill)

    await characterSkillRepository.create(
      makeCharacterSkill({
        characterId: character.id.toString(),
        skillId: skill.id.toString(),
      })
    )

    await pendingSkillChoiceRepository.create(
      makePendingSkillChoice({
        characterId: character.id.toString(),
        optionSkillIds: [skill.id.toString()],
      })
    )

    const result = await sut.execute({
      userId: user.id.toString(),
      characterId: character.id.toString(),
      skillId: skill.id.toString(),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceAlreadyExistError)
  })

  it('should return SkillSwapTargetRequiredError when roster is full and no currentSkillId is given', async () => {
    const user = makeUser()
    await userRepository.create(user)

    const character = makeCharacter({
      userId: user.id.toString(),
      pendingSkillSelections: 1,
    })
    await characterRepository.create(character)

    for (let i = 0; i < 4; i++) {
      await characterSkillRepository.create(
        makeCharacterSkill({ characterId: character.id.toString() })
      )
    }

    const skill = makeSkill({ powerId: character.powerId })
    await skillRepository.create(skill)

    await pendingSkillChoiceRepository.create(
      makePendingSkillChoice({
        characterId: character.id.toString(),
        optionSkillIds: [skill.id.toString()],
      })
    )

    const result = await sut.execute({
      userId: user.id.toString(),
      characterId: character.id.toString(),
      skillId: skill.id.toString(),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(SkillSwapTargetRequiredError)
  })

  it('should swap the given current skill for the chosen option when roster is full', async () => {
    const user = makeUser()
    await userRepository.create(user)

    const character = makeCharacter({
      userId: user.id.toString(),
      pendingSkillSelections: 1,
    })
    await characterRepository.create(character)

    const existingSkills = []
    for (let i = 0; i < 4; i++) {
      const characterSkill = makeCharacterSkill({
        characterId: character.id.toString(),
      })
      await characterSkillRepository.create(characterSkill)
      existingSkills.push(characterSkill)
    }

    const newSkill = makeSkill({ powerId: character.powerId })
    await skillRepository.create(newSkill)

    await pendingSkillChoiceRepository.create(
      makePendingSkillChoice({
        characterId: character.id.toString(),
        optionSkillIds: [newSkill.id.toString()],
      })
    )

    const skillToReplace = existingSkills[0]!

    const result = await sut.execute({
      userId: user.id.toString(),
      characterId: character.id.toString(),
      skillId: newSkill.id.toString(),
      currentSkillId: skillToReplace.skillId,
    })

    expect(result.isRight()).toBe(true)

    const roster = await characterSkillRepository.findAllByCharacterId(
      character.id.toString()
    )
    const rosterIds = roster.map((cs) => cs.skillId)
    expect(rosterIds).toHaveLength(4)
    expect(rosterIds).not.toContain(skillToReplace.skillId)
    expect(rosterIds).toContain(newSkill.id.toString())
  })

  it('should return ResourceNotFoundError when currentSkillId does not belong to the character', async () => {
    const user = makeUser()
    await userRepository.create(user)

    const character = makeCharacter({
      userId: user.id.toString(),
      pendingSkillSelections: 1,
    })
    await characterRepository.create(character)

    for (let i = 0; i < 4; i++) {
      await characterSkillRepository.create(
        makeCharacterSkill({ characterId: character.id.toString() })
      )
    }

    const newSkill = makeSkill({ powerId: character.powerId })
    await skillRepository.create(newSkill)

    await pendingSkillChoiceRepository.create(
      makePendingSkillChoice({
        characterId: character.id.toString(),
        optionSkillIds: [newSkill.id.toString()],
      })
    )

    const result = await sut.execute({
      userId: user.id.toString(),
      characterId: character.id.toString(),
      skillId: newSkill.id.toString(),
      currentSkillId: 'not-owned-skill-id',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should return UnauthorizedError when character does not belong to user', async () => {
    const user = makeUser()
    await userRepository.create(user)

    const character = makeCharacter({ pendingSkillSelections: 1 })
    await characterRepository.create(character)

    const result = await sut.execute({
      userId: user.id.toString(),
      characterId: character.id.toString(),
      skillId: 'any-id',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(UnauthorizedError)
  })

  it('should return ResourceNotFoundError when character not found', async () => {
    const user = makeUser()
    await userRepository.create(user)

    const result = await sut.execute({
      userId: user.id.toString(),
      characterId: 'non-existent-id',
      skillId: 'any-id',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
