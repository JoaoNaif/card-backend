import { beforeEach, describe, expect, it } from 'vitest'
import { makeCharacter } from '../../repositories/test/factories/make-character'
import { InMemoryCharacterRepository } from '../../repositories/test/in-memory-character-repository'
import { InMemoryTeamMemberRepository } from '../../repositories/test/in-memory-team-member-repository'
import { InMemoryTeamRepository } from '../../repositories/test/in-memory-team-repository'
import { AddTeamMemberUseCase } from './add-team-member'
import { GetTeamUseCase } from './get-team'

let teamRepository: InMemoryTeamRepository
let teamMemberRepository: InMemoryTeamMemberRepository
let characterRepository: InMemoryCharacterRepository
let addTeamMember: AddTeamMemberUseCase
let sut: GetTeamUseCase

describe('GetTeamUseCase', () => {
  beforeEach(() => {
    teamRepository = new InMemoryTeamRepository()
    teamMemberRepository = new InMemoryTeamMemberRepository()
    characterRepository = new InMemoryCharacterRepository()
    addTeamMember = new AddTeamMemberUseCase(
      teamRepository,
      teamMemberRepository,
      characterRepository
    )
    sut = new GetTeamUseCase(
      teamRepository,
      teamMemberRepository,
      characterRepository
    )
  })

  it('should return an empty team when the user has not built one yet', async () => {
    const result = await sut.execute({ userId: 'user-1' })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.team).toEqual({ id: null, members: [] })
    }
  })

  it('should return the current team composition with character names', async () => {
    const character = makeCharacter({ userId: 'user-1' })
    await characterRepository.create(character)
    await addTeamMember.execute({
      userId: 'user-1',
      characterId: character.id.toString(),
      positionRow: 1,
      positionCol: 2,
    })

    const result = await sut.execute({ userId: 'user-1' })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.team.id).not.toBeNull()
      expect(result.value.team.members).toEqual([
        {
          characterId: character.id.toString(),
          characterName: character.name,
          positionRow: 1,
          positionCol: 2,
        },
      ])
    }
  })
})
