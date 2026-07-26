import { beforeEach, describe, expect, it } from 'vitest'
import { ResourceAlreadyExistError } from '../../core/error/err/resource-already-exist-error'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'
import { UnauthorizedError } from '../../core/error/err/unauthorized-error'
import { makeCharacter } from '../../repositories/test/factories/make-character'
import { InMemoryCharacterRepository } from '../../repositories/test/in-memory-character-repository'
import { InMemoryTeamMemberRepository } from '../../repositories/test/in-memory-team-member-repository'
import { InMemoryTeamRepository } from '../../repositories/test/in-memory-team-repository'
import { AddTeamMemberUseCase } from './add-team-member'
import { InvalidTeamPositionError } from './err/invalid-team-position-error'
import { TeamFullError } from './err/team-full-error'
import { TeamSlotOccupiedError } from './err/team-slot-occupied-error'

let teamRepository: InMemoryTeamRepository
let teamMemberRepository: InMemoryTeamMemberRepository
let characterRepository: InMemoryCharacterRepository
let sut: AddTeamMemberUseCase

describe('AddTeamMemberUseCase', () => {
  beforeEach(() => {
    teamRepository = new InMemoryTeamRepository()
    teamMemberRepository = new InMemoryTeamMemberRepository()
    characterRepository = new InMemoryCharacterRepository()
    sut = new AddTeamMemberUseCase(
      teamRepository,
      teamMemberRepository,
      characterRepository
    )
  })

  it('should create a team on first add and add the character to the requested slot', async () => {
    const character = makeCharacter({ userId: 'user-1' })
    await characterRepository.create(character)

    const result = await sut.execute({
      userId: 'user-1',
      characterId: character.id.toString(),
      positionRow: 1,
      positionCol: 2,
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.teamMember).toEqual({
        characterId: character.id.toString(),
        characterName: character.name,
        positionRow: 1,
        positionCol: 2,
      })
    }
    expect(teamRepository.items).toHaveLength(1)
    expect(teamMemberRepository.items).toHaveLength(1)
  })

  it('should reuse the existing team on subsequent adds', async () => {
    const characterA = makeCharacter({ userId: 'user-1' })
    const characterB = makeCharacter({ userId: 'user-1' })
    await characterRepository.create(characterA)
    await characterRepository.create(characterB)

    await sut.execute({
      userId: 'user-1',
      characterId: characterA.id.toString(),
      positionRow: 0,
      positionCol: 0,
    })
    await sut.execute({
      userId: 'user-1',
      characterId: characterB.id.toString(),
      positionRow: 0,
      positionCol: 1,
    })

    expect(teamRepository.items).toHaveLength(1)
    expect(teamMemberRepository.items).toHaveLength(2)
  })

  it('should return error when character does not exist', async () => {
    const result = await sut.execute({
      userId: 'user-1',
      characterId: 'non-existent',
      positionRow: 0,
      positionCol: 0,
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should return error when character does not belong to the user', async () => {
    const character = makeCharacter({ userId: 'other-user' })
    await characterRepository.create(character)

    const result = await sut.execute({
      userId: 'user-1',
      characterId: character.id.toString(),
      positionRow: 0,
      positionCol: 0,
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(UnauthorizedError)
  })

  it('should return error when position is outside the grid', async () => {
    const character = makeCharacter({ userId: 'user-1' })
    await characterRepository.create(character)

    const result = await sut.execute({
      userId: 'user-1',
      characterId: character.id.toString(),
      positionRow: 3,
      positionCol: 0,
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(InvalidTeamPositionError)
  })

  it('should return error when the team already has 4 members', async () => {
    const owner = 'user-1'
    for (let i = 0; i < 4; i++) {
      const character = makeCharacter({ userId: owner })
      await characterRepository.create(character)
      const result = await sut.execute({
        userId: owner,
        characterId: character.id.toString(),
        positionRow: Math.floor(i / 3),
        positionCol: i % 3,
      })
      expect(result.isRight()).toBe(true)
    }

    const fifthCharacter = makeCharacter({ userId: owner })
    await characterRepository.create(fifthCharacter)

    const result = await sut.execute({
      userId: owner,
      characterId: fifthCharacter.id.toString(),
      positionRow: 1,
      positionCol: 1,
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(TeamFullError)
  })

  it('should return error when the character is already in the team', async () => {
    const character = makeCharacter({ userId: 'user-1' })
    await characterRepository.create(character)

    await sut.execute({
      userId: 'user-1',
      characterId: character.id.toString(),
      positionRow: 0,
      positionCol: 0,
    })

    const result = await sut.execute({
      userId: 'user-1',
      characterId: character.id.toString(),
      positionRow: 0,
      positionCol: 1,
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceAlreadyExistError)
  })

  it('should return error when the slot is already occupied', async () => {
    const characterA = makeCharacter({ userId: 'user-1' })
    const characterB = makeCharacter({ userId: 'user-1' })
    await characterRepository.create(characterA)
    await characterRepository.create(characterB)

    await sut.execute({
      userId: 'user-1',
      characterId: characterA.id.toString(),
      positionRow: 0,
      positionCol: 0,
    })

    const result = await sut.execute({
      userId: 'user-1',
      characterId: characterB.id.toString(),
      positionRow: 0,
      positionCol: 0,
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(TeamSlotOccupiedError)
  })
})
