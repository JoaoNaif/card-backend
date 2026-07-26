import { left, right, type Either } from '../../core/either'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'
import type { ITeamMemberRepository } from '../../repositories/interface/team-member-repository'
import type { ITeamRepository } from '../../repositories/interface/team-repository'

interface RemoveTeamMemberUseCaseRequest {
  userId: string
  characterId: string
}

type RemoveTeamMemberUseCaseResponse = Either<ResourceNotFoundError, object>

export class RemoveTeamMemberUseCase {
  constructor(
    private teamRepository: ITeamRepository,
    private teamMemberRepository: ITeamMemberRepository
  ) {}

  async execute({
    userId,
    characterId,
  }: RemoveTeamMemberUseCaseRequest): Promise<RemoveTeamMemberUseCaseResponse> {
    const team = await this.teamRepository.findByUserId(userId)
    if (!team) return left(new ResourceNotFoundError('Team'))

    const teamMember = await this.teamMemberRepository.findByTeamIdAndCharacterId(
      team.id.toString(),
      characterId
    )
    if (!teamMember) return left(new ResourceNotFoundError('TeamMember'))

    await this.teamMemberRepository.delete(teamMember)

    return right({})
  }
}
