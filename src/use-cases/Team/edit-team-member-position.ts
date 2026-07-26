import { left, right, type Either } from '../../core/either'
import { TEAM_GRID_SIZE } from '../../core/constants/team-grid'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'
import type { ICharacterRepository } from '../../repositories/interface/character-repository'
import type { ITeamMemberRepository } from '../../repositories/interface/team-member-repository'
import type { ITeamRepository } from '../../repositories/interface/team-repository'
import type { DtoTeamMemberRaw } from './dtos/dto-team-raw'
import { InvalidTeamPositionError } from './err/invalid-team-position-error'
import { TeamSlotOccupiedError } from './err/team-slot-occupied-error'

interface EditTeamMemberPositionUseCaseRequest {
  userId: string
  characterId: string
  positionRow: number
  positionCol: number
}

type EditTeamMemberPositionUseCaseResponse = Either<
  ResourceNotFoundError | InvalidTeamPositionError | TeamSlotOccupiedError,
  { teamMember: DtoTeamMemberRaw }
>

function isValidPosition(position: number): boolean {
  return Number.isInteger(position) && position >= 0 && position < TEAM_GRID_SIZE
}

export class EditTeamMemberPositionUseCase {
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
  }: EditTeamMemberPositionUseCaseRequest): Promise<EditTeamMemberPositionUseCaseResponse> {
    const team = await this.teamRepository.findByUserId(userId)
    if (!team) return left(new ResourceNotFoundError('Team'))

    const teamMember = await this.teamMemberRepository.findByTeamIdAndCharacterId(
      team.id.toString(),
      characterId
    )
    if (!teamMember) return left(new ResourceNotFoundError('TeamMember'))

    if (!isValidPosition(positionRow) || !isValidPosition(positionCol)) {
      return left(new InvalidTeamPositionError())
    }

    const occupant = await this.teamMemberRepository.findByTeamIdAndPosition(
      team.id.toString(),
      positionRow,
      positionCol
    )
    if (occupant && !occupant.id.equals(teamMember.id)) {
      return left(new TeamSlotOccupiedError())
    }

    teamMember.positionRow = positionRow
    teamMember.positionCol = positionCol

    await this.teamMemberRepository.save(teamMember)

    const character = await this.characterRepository.findById(characterId)

    return right({
      teamMember: {
        characterId: teamMember.characterId,
        characterName: character?.name ?? '',
        positionRow: teamMember.positionRow,
        positionCol: teamMember.positionCol,
      },
    })
  }
}