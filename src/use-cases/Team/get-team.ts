import { right, type Either } from '../../core/either'
import type { ICharacterRepository } from '../../repositories/interface/character-repository'
import type { ITeamMemberRepository } from '../../repositories/interface/team-member-repository'
import type { ITeamRepository } from '../../repositories/interface/team-repository'
import type { DtoTeamRaw } from './dtos/dto-team-raw'

interface GetTeamUseCaseRequest {
  userId: string
}

type GetTeamUseCaseResponse = Either<never, { team: DtoTeamRaw }>

export class GetTeamUseCase {
  constructor(
    private teamRepository: ITeamRepository,
    private teamMemberRepository: ITeamMemberRepository,
    private characterRepository: ICharacterRepository
  ) {}

  async execute({
    userId,
  }: GetTeamUseCaseRequest): Promise<GetTeamUseCaseResponse> {
    const team = await this.teamRepository.findByUserId(userId)

    if (!team) {
      return right({ team: { id: null, members: [] } })
    }

    const members = await this.teamMemberRepository.findAllByTeamId(
      team.id.toString()
    )

    const characters = await this.characterRepository.findManyByIds(
      members.map((member) => member.characterId)
    )

    return right({
      team: {
        id: team.id.toString(),
        members: members.map((member) => ({
          characterId: member.characterId,
          characterName:
            characters.find((c) => c.id.toString() === member.characterId)
              ?.name ?? '',
          positionRow: member.positionRow,
          positionCol: member.positionCol,
        })),
      },
    })
  }
}
