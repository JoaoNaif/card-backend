import { describe, it, expect, beforeEach } from 'vitest'
import { InMemoryUserRepository } from '../../repositories/test/in-memory-user-repository'
import { makeUser } from '../../repositories/test/factories/make-user'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'
import { UnauthorizedError } from '../../core/error/err/unauthorized-error'
import { InMemoryCharacterRepository } from '../../repositories/test/in-memory-character-repository'
import { makeCharacter } from '../../repositories/test/factories/make-character'
import { GetSkillOptionsUseCase } from './get-skill-options'
import { InMemorySkillRepository } from '../../repositories/test/in-memory-skill-repository'
import { InMemoryCharacterSkillRepository } from '../../repositories/test/in-memory-character-skill-repository'
import { InMemoryPowerRepository } from '../../repositories/test/in-memory-power-repository'
import { InMemoryBattleFieldRepository } from '../../repositories/test/in-memory-battle-field-repository'
import { makeCharacterSkill } from '../../repositories/test/factories/make-character-skill'
import { makeSkill } from '../../repositories/test/factories/make-skill'
import { makePower } from '../../repositories/test/factories/make-power'
import { UnavailabelSkillOptionsError } from './err/unavailable-skills-options-error'
import { InMemoryPendingSkillChoiceRepository } from '../../repositories/test/in-memory-pending-skill-choice-repository'
import { makePendingSkillChoice } from '../../repositories/test/factories/make-pending-skill-choice'

let userRepository: InMemoryUserRepository
let characterRepository: InMemoryCharacterRepository
let skillRepository: InMemorySkillRepository
let characterSkillRepository: InMemoryCharacterSkillRepository
let powerRepository: InMemoryPowerRepository
let battleFieldRepository: InMemoryBattleFieldRepository
let pendingSkillChoiceRepository: InMemoryPendingSkillChoiceRepository
let sut: GetSkillOptionsUseCase

describe('GetSkillOptionsUseCase', () => {
  beforeEach(() => {
    userRepository = new InMemoryUserRepository()
    characterRepository = new InMemoryCharacterRepository()
    skillRepository = new InMemorySkillRepository()
    characterSkillRepository = new InMemoryCharacterSkillRepository()
    powerRepository = new InMemoryPowerRepository()
    battleFieldRepository = new InMemoryBattleFieldRepository()
    pendingSkillChoiceRepository = new InMemoryPendingSkillChoiceRepository()
    sut = new GetSkillOptionsUseCase(
      characterRepository,
      userRepository,
      skillRepository,
      characterSkillRepository,
      powerRepository,
      battleFieldRepository,
      pendingSkillChoiceRepository
    )
  })

  it('should return skill options successfully', async () => {
    const user = makeUser()
    await userRepository.create(user)

    const power = makePower()
    await powerRepository.create(power)

    const character = makeCharacter({
      userId: user.id.toString(),
      pendingSkillSelections: 1,
      level: 10,
      powerId: power.id.toString(),
    })
    await characterRepository.create(character)

    await skillRepository.create(makeSkill({ powerId: character.powerId, minLevel: 1 }))
    await skillRepository.create(makeSkill({ powerId: character.powerId, minLevel: 1 }))
    await skillRepository.create(makeSkill({ powerId: character.powerId, minLevel: 1 }))

    const result = await sut.execute({
      userId: user.id.toString(),
      characterId: character.id.toString(),
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.options.length).toBeGreaterThan(0)
      expect(result.value.options[0]?.power.id).toBe(character.powerId)
    }
  })

  it('should return the same options on repeated calls instead of re-rolling', async () => {
    const user = makeUser()
    await userRepository.create(user)

    const power = makePower()
    await powerRepository.create(power)

    const character = makeCharacter({
      userId: user.id.toString(),
      pendingSkillSelections: 1,
      level: 10,
      powerId: power.id.toString(),
    })
    await characterRepository.create(character)

    for (let i = 0; i < 10; i++) {
      await skillRepository.create(
        makeSkill({ powerId: character.powerId, minLevel: 1 })
      )
    }

    const first = await sut.execute({
      userId: user.id.toString(),
      characterId: character.id.toString(),
    })
    const second = await sut.execute({
      userId: user.id.toString(),
      characterId: character.id.toString(),
    })

    expect(first.isRight()).toBe(true)
    expect(second.isRight()).toBe(true)
    if (first.isRight() && second.isRight()) {
      const firstIds = first.value.options.map((s) => s.id).sort()
      const secondIds = second.value.options.map((s) => s.id).sort()
      expect(secondIds).toEqual(firstIds)
    }
    expect(pendingSkillChoiceRepository.items).toHaveLength(1)
  })

  it('should read options from an already open pending skill choice', async () => {
    const user = makeUser()
    await userRepository.create(user)

    const power = makePower()
    await powerRepository.create(power)

    const character = makeCharacter({
      userId: user.id.toString(),
      pendingSkillSelections: 1,
      level: 10,
      powerId: power.id.toString(),
    })
    await characterRepository.create(character)

    const skill = makeSkill({ powerId: character.powerId, minLevel: 1 })
    await skillRepository.create(skill)

    const pending = makePendingSkillChoice({
      characterId: character.id.toString(),
      optionSkillIds: [skill.id.toString()],
    })
    await pendingSkillChoiceRepository.create(pending)

    const result = await sut.execute({
      userId: user.id.toString(),
      characterId: character.id.toString(),
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.options.map((s) => s.id)).toEqual([
        skill.id.toString(),
      ])
    }
  })

  it('should exclude already owned skills from options', async () => {
    const user = makeUser()
    await userRepository.create(user)

    const power = makePower()
    await powerRepository.create(power)

    const character = makeCharacter({
      userId: user.id.toString(),
      pendingSkillSelections: 1,
      level: 10,
      powerId: power.id.toString(),
    })
    await characterRepository.create(character)

    const ownedSkill = makeSkill({ powerId: character.powerId, minLevel: 1 })
    await skillRepository.create(ownedSkill)

    const otherSkill = makeSkill({ powerId: character.powerId, minLevel: 1 })
    await skillRepository.create(otherSkill)

    await characterSkillRepository.create(
      makeCharacterSkill({
        characterId: character.id.toString(),
        skillId: ownedSkill.id.toString(),
      })
    )

    const result = await sut.execute({
      userId: user.id.toString(),
      characterId: character.id.toString(),
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      const ids = result.value.options.map((s) => s.id.toString())
      expect(ids).not.toContain(ownedSkill.id.toString())
    }
  })

  it('should return UnavailabelSkillOptionsError when pendingSkillSelections is 0', async () => {
    const user = makeUser()
    await userRepository.create(user)

    const character = makeCharacter({
      userId: user.id.toString(),
      pendingSkillSelections: 0,
    })
    await characterRepository.create(character)

    const result = await sut.execute({
      userId: user.id.toString(),
      characterId: character.id.toString(),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(UnavailabelSkillOptionsError)
  })

  it('should return UnavailabelSkillOptionsError when pool is empty', async () => {
    const user = makeUser()
    await userRepository.create(user)

    const character = makeCharacter({
      userId: user.id.toString(),
      pendingSkillSelections: 1,
      level: 1,
    })
    await characterRepository.create(character)

    await skillRepository.create(makeSkill({ powerId: character.powerId, minLevel: 50 }))

    const result = await sut.execute({
      userId: user.id.toString(),
      characterId: character.id.toString(),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(UnavailabelSkillOptionsError)
  })

  it('should return UnauthorizedError when character does not belong to user', async () => {
    const user = makeUser()
    await userRepository.create(user)

    const character = makeCharacter({ pendingSkillSelections: 1 })
    await characterRepository.create(character)

    const result = await sut.execute({
      userId: user.id.toString(),
      characterId: character.id.toString(),
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
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should return ResourceNotFoundError when user not found', async () => {
    const character = makeCharacter()
    await characterRepository.create(character)

    const result = await sut.execute({
      userId: 'non-existent-id',
      characterId: character.id.toString(),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
