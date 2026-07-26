import { beforeEach, describe, expect, it } from 'vitest'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'
import { makeCharacter } from '../../repositories/test/factories/make-character'
import { InMemoryCharacterRepository } from '../../repositories/test/in-memory-character-repository'
import { InMemoryTeamMemberRepository } from '../../repositories/test/in-memory-team-member-repository'
import { InMemoryTeamRepository } from '../../repositories/test/in-memory-team-repository'
import { AddTeamMemberUseCase } from './add-team-member'
import { EditTeamMemberPositionUseCase } from './edit-team-member-position'
import { InvalidTeamPositionError } from './err/invalid-team-position-error'
import { TeamSlotOccupiedError } from './err/team-slot-occupied-error'

let teamRepository: InMemoryTeamRepository
let teamMemberRepository: InMemoryTeamMemberRepository
let characterRepository: InMemoryCharacterRepository
let addTeamMember: AddTeamMemberUseCase
let sut: EditTeamMemberPositionUseCase

describe('EditTeamMemberPositionUseCase', () => {
  beforeEach(() => {
    teamRepository = new InMemoryTeamRepository()
    teamMemberRepository = new InMemoryTeamMemberRepository()
    characterRepository = new InMemoryCharacterRepository()
    addTeamMember = new AddTeamMemberUseCase(
      teamRepository,
      teamMemberRepository,
      characterRepository
    )
    sut = new EditTeamMemberPositionUseCase(
      teamRepository,
      teamMemberRepository,
      characterRepository
    )
  })

  it('should move the character to a free slot', async () => {
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
      positionRow: 2,
      positionCol: 2,
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.teamMember).toEqual({
        characterId: character.id.toString(),
        characterName: character.name,
        positionRow: 2,
        positionCol: 2,
      })
    }
    expect(teamMemberRepository.items).toHaveLength(1)
    expect(teamMemberRepository.items[0]?.positionRow).toBe(2)
    expect(teamMemberRepository.items[0]?.positionCol).toBe(2)
  })

  it('should allow moving to the same position it already occupies (no-op)', async () => {
    const character = makeCharacter({ userId: 'user-1' })
    await characterRepository.create(character)
    await addTeamMember.execute({
      userId: 'user-1',
      characterId: character.id.toString(),
      positionRow: 1,
      positionCol: 1,
    })

    const result = await sut.execute({
      userId: 'user-1',
      characterId: character.id.toString(),
      positionRow: 1,
      positionCol: 1,
    })

    expect(result.isRight()).toBe(true)
  })

  it('should return error when the target slot has another character', async () => {
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
    await addTeamMember.execute({
      userId: 'user-1',
      characterId: characterB.id.toString(),
      positionRow: 0,
      positionCol: 1,
    })

    const result = await sut.execute({
      userId: 'user-1',
      characterId: characterA.id.toString(),
      positionRow: 0,
      positionCol: 1,
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(TeamSlotOccupiedError)
    expect(teamMemberRepository.items.find(
      (m) => m.characterId === characterA.id.toString()
    )?.positionCol).toBe(0)
  })

  it('should return error when position is outside the grid', async () => {
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
      positionRow: 5,
      positionCol: 0,
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(InvalidTeamPositionError)
  })

  it('should return error when the user has no team', async () => {
    const result = await sut.execute({
      userId: 'user-1',
      characterId: 'some-character',
      positionRow: 0,
      positionCol: 0,
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
      positionRow: 1,
      positionCol: 1,
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})