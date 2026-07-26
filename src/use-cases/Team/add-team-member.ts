import { left, right, type Either } from '../../core/either'
import { ResourceAlreadyExistError } from '../../core/error/err/resource-already-exist-error'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'
import { UnauthorizedError } from '../../core/error/err/unauthorized-error'
import { Team, TEAM_GRID_SIZE, TEAM_MAX_MEMBERS } from '../../entities/team'
import { TeamMember } from '../../entities/team-member'
import type { ICharacterRepository } from '../../repositories/interface/character-repository'
import type { ITeamMemberRepository } from '../../repositories/interface/team-member-repository'
import type { ITeamRepository } from '../../repositories/interface/team-repository'
import type { DtoTeamMemberRaw } from './dtos/dto-team-raw'
import { InvalidTeamPositionError } from './err/invalid-team-position-error'
import { TeamFullError } from './err/team-full-error'
import { TeamSlotOccupiedError } from './err/team-slot-occupied-error'

interface AddTeamMemberUseCaseRequest {
  userId: string
  characterId: string
  positionRow: number
  positionCol: number
}

type AddTeamMemberUseCaseResponse = Either<
  | ResourceNotFoundError
  | UnauthorizedError
  | InvalidTeamPositionError
  | TeamFullError
  | ResourceAlreadyExistError
  | TeamSlotOccupiedError,
  { teamMember: DtoTeamMemberRaw }
>

function isValidPosition(position: number): boolean {
  return Number.isInteger(position) && position >= 0 && position < TEAM_GRID_SIZE
}

export class AddTeamMemberUseCase {
  constructor(
    private teamRepository: ITeamRepository,
    private teamMemberRepository: ITeamMemberRepository,
    private characterRepository: ICharacterRepository
  ) {}

  async execute({
    userId,
    characterId,
    positionRow,
    positionCol,
  }: AddTeamMemberUseCaseRequest): Promise<AddTeamMemberUseCaseResponse> {
    const character = await this.characterRepository.findById(characterId)

    if (!character) return left(new ResourceNotFoundError('Character'))
    if (character.userId !== userId) return left(new UnauthorizedError())

    if (!isValidPosition(positionRow) || !isValidPosition(positionCol)) {
      return left(new InvalidTeamPositionError())
    }

    let team = await this.teamRepository.findByUserId(userId)
    if (!team) {
      team = Team.create({ userId })
      await this.teamRepository.create(team)
    }

    const members = await this.teamMemberRepository.findAllByTeamId(
      team.id.toString()
    )
    if (members.length >= TEAM_MAX_MEMBERS) return left(new TeamFullError())

    const existingByCharacter =
      await this.teamMemberRepository.findByTeamIdAndCharacterId(
        team.id.toString(),
        characterId
      )
    if (existingByCharacter) {
      return left(new ResourceAlreadyExistError('TeamMember'))
    }

    const existingByPosition =
      await this.teamMemberRepository.findByTeamIdAndPosition(
        team.id.toString(),
        positionRow,
        positionCol
      )
    if (existingByPosition) return left(new TeamSlotOccupiedError())

    const teamMember = TeamMember.create({
      teamId: team.id.toString(),
      characterId,
      positionRow,
      positionCol,
    })

    await this.teamMemberRepository.create(teamMember)

    return right({
      teamMember: {
        characterId,
        characterName: character.name,
        positionRow,
        positionCol,
      },
    })
  }
}
