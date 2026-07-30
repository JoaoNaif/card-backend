import { left, right, type Either } from '../../core/either'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'
import { BattleStatus } from '../../entities/battle'
import type { IBattleRepository } from '../../repositories/interface/battle-repository'
import type { IBattleTeamRepository } from '../../repositories/interface/battle-team-repository'
import type { ICharacterRepository } from '../../repositories/interface/character-repository'
import type { IUserRepository } from '../../repositories/interface/user-repository'
import type { DtoUserRaw } from './dtos/dto-user-raw'

interface GetUserRequest {
  id: string
}

type GetUserResponse = Either<
  ResourceNotFoundError,
  {
    user: DtoUserRaw
  }
>

export class GetUserUseCase {
  constructor(
    private userRepository: IUserRepository,
    private characterRepository: ICharacterRepository,
    private battleTeamRepository: IBattleTeamRepository,
    private battleRepository: IBattleRepository
  ) {}

  async execute({ id }: GetUserRequest): Promise<GetUserResponse> {
    const user = await this.userRepository.findById(id)

    if (!user) {
      return left(new ResourceNotFoundError('User'))
    }

    const rosterCount = await this.characterRepository.countByUserId(id)

    const battleTeams = await this.battleTeamRepository.findManyByUserId(id)
    const battles = await this.battleRepository.findManyByIds(
      battleTeams.map((team) => team.battleId)
    )
    const battlesById = new Map(
      battles.map((battle) => [battle.id.toString(), battle])
    )

    let battlesPlayed = 0
    let wins = 0

    for (const team of battleTeams) {
      const battle = battlesById.get(team.battleId)
      if (!battle || battle.status !== BattleStatus.COMPLETED) continue

      battlesPlayed += 1
      if (battle.winnerTerm === team.teamNumber) wins += 1
    }

    const winRate =
      battlesPlayed > 0 ? Math.round((wins / battlesPlayed) * 1000) / 10 : 0

    return right({
      user: {
        id: user.id.toString(),
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        stats: {
          rosterCount,
          battlesPlayed,
          wins,
          winRate,
        },
      },
    })
  }
}
