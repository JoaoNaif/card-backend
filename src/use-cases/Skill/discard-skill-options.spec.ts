import { describe, it, expect, beforeEach } from 'vitest'
import { InMemoryUserRepository } from '../../repositories/test/in-memory-user-repository'
import { makeUser } from '../../repositories/test/factories/make-user'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'
import { UnauthorizedError } from '../../core/error/err/unauthorized-error'
import { InMemoryCharacterRepository } from '../../repositories/test/in-memory-character-repository'
import { makeCharacter } from '../../repositories/test/factories/make-character'
import { InMemoryPendingSkillChoiceRepository } from '../../repositories/test/in-memory-pending-skill-choice-repository'
import { makePendingSkillChoice } from '../../repositories/test/factories/make-pending-skill-choice'
import { DiscardSkillOptionsUseCase } from './discard-skill-options'
import { UnavailabelSkillOptionsError } from './err/unavailable-skills-options-error'

let userRepository: InMemoryUserRepository
let characterRepository: InMemoryCharacterRepository
let pendingSkillChoiceRepository: InMemoryPendingSkillChoiceRepository
let sut: DiscardSkillOptionsUseCase

describe('DiscardSkillOptionsUseCase', () => {
  beforeEach(() => {
    userRepository = new InMemoryUserRepository()
    characterRepository = new InMemoryCharacterRepository()
    pendingSkillChoiceRepository = new InMemoryPendingSkillChoiceRepository()
    sut = new DiscardSkillOptionsUseCase(
      characterRepository,
      userRepository,
      pendingSkillChoiceRepository
    )
  })

  it('should resolve the pending choice without assigning a skill and decrement pendingSkillSelections', async () => {
    const user = makeUser()
    await userRepository.create(user)

    const character = makeCharacter({
      userId: user.id.toString(),
      pendingSkillSelections: 1,
    })
    await characterRepository.create(character)

    await pendingSkillChoiceRepository.create(
      makePendingSkillChoice({ characterId: character.id.toString() })
    )

    const result = await sut.execute({
      userId: user.id.toString(),
      characterId: character.id.toString(),
    })

    expect(result.isRight()).toBe(true)

    const openPending = await pendingSkillChoiceRepository.findOpenByCharacterId(
      character.id.toString()
    )
    expect(openPending).toBeNull()

    const savedCharacter = await characterRepository.findById(
      character.id.toString()
    )
    expect(savedCharacter?.pendingSkillSelections).toBe(0)
  })

  it('should return UnavailabelSkillOptionsError when there is no open pending choice', async () => {
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
})
