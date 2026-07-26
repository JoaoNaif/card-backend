import { beforeEach, describe, expect, it } from 'vitest'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'
import { makeCharacter } from '../../repositories/test/factories/make-character'
import { InMemoryCharacterRepository } from '../../repositories/test/in-memory-character-repository'
import { InMemoryTeamMemberRepository } from '../../repositories/test/in-memory-team-member-repository'
import { InMemoryTeamRepository } from '../../repositories/test/in-memory-team-repository'
import { AddTeamMemberUseCase } from './add-team-member'
import { RemoveTeamMemberUseCase } from './remove-team-member'

let teamRepository: InMemoryTeamRepository
let teamMemberRepository: InMemoryTeamMemberRepository
let characterRepository: InMemoryCharacterRepository
let addTeamMember: AddTeamMemberUseCase
let sut: RemoveTeamMemberUseCase

describe('RemoveTeamMemberUseCase', () => {
  beforeEach(() => {
    teamRepository = new InMemoryTeamRepository()
    teamMemberRepository = new InMemoryTeamMemberRepository()
    characterRepository = new InMemoryCharacterRepository()
    addTeamMember = new AddTeamMemberUseCase(
      teamRepository,
      teamMemberRepository,
      characterRepository
    )
    sut = new RemoveTeamMemberUseCase(teamRepository, teamMemberRepository)
  })

  it('should remove a character from the team, freeing its slot', async () => {
    const character = makeCharacter({ userId: 'user-1' })
    await characterRepository.create(character)
    await addTeamMember.execute({
      userId: 'user-1',
      characterId: character.id.toString(),
      positionRow: 0,
      positionCol: 0,
    })

    const result = await sut.execute({
      userId: 'user-1',
      characterId: character.id.toString(),
    })

    expect(result.isRight()).toBe(true)
    expect(teamMemberRepository.items).toHaveLength(0)
  })

  it('should allow re-adding a character to a different slot after removal', async () => {
    const character = makeCharacter({ userId: 'user-1' })
    await characterRepository.create(character)
    await addTeamMember.execute({
      userId: 'user-1',
      characterId: character.id.toString(),
      positionRow: 0,
      positionCol: 0,
    })
    await sut.execute({
      userId: 'user-1',
      characterId: character.id.toString(),
    })

    const result = await addTeamMember.execute({
      userId: 'user-1',
      characterId: character.id.toString(),
      positionRow: 2,
      positionCol: 2,
    })

    expect(result.isRight()).toBe(true)
    expect(teamMemberRepository.items).toHaveLength(1)
  })

  it('should return error when the user has no team', async () => {
    const result = await sut.execute({
      userId: 'user-1',
      characterId: 'some-character',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should return error when the character is not in the team', async () => {
    const characterA = makeCharacter({ userId: 'user-1' })
    const characterB = makeCharacter({ userId: 'user-1' })
    await characterRepository.create(characterA)
    await characterRepository.create(characterB)
    await addTeamMember.execute({
      userId: 'user-1',
      characterId: characterA.id.toString(),
      positionRow: 0,
      positionCol: 0,
    })

    const result = await sut.execute({
      userId: 'user-1',
      characterId: characterB.id.toString(),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
