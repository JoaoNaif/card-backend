import { right, type Either } from '../../core/either'
import type { BattleMode, BattleStatus } from '../../entities/battle'
import type { IBattleRepository } from '../../repositories/interface/battle-repository'
import type { IBattleTeamRepository } from '../../repositories/interface/battle-team-repository'
import type { IUserRepository } from '../../repositories/interface/user-repository'

interface ListBattleHistoryUseCaseRequest {
  userId: string
}

type BattleOutcome = 'WIN' | 'LOSS' | 'DRAW'

interface BattleHistoryItem {
  battleId: string
  mode: BattleMode
  status: BattleStatus
  createdAt: Date
  totalTurns: number
  myTeamNumber: number
  outcome: BattleOutcome
  opponent: {
    userId: string | null
    name: string | null
  }
}

interface ListBattleHistoryUseCaseResponse {
  battles: BattleHistoryItem[]
}

type ListBattleHistoryResponse = Either<never, ListBattleHistoryUseCaseResponse>

export class ListBattleHistoryUseCase {
  constructor(
    private battleTeamRepository: IBattleTeamRepository,
    private battleRepository: IBattleRepository,
    private userRepository: IUserRepository
  ) {}

  async execute({
    userId,
  }: ListBattleHistoryUseCaseRequest): Promise<ListBattleHistoryResponse> {
    const myTeams = await this.battleTeamRepository.findManyByUserId(userId)

    const battleIds = [...new Set(myTeams.map((team) => team.battleId))]
    const battles = await this.battleRepository.findManyByIds(battleIds)

    const opponentUserIds = new Set<string>()
    const teamsByBattleId = new Map<
      string,
      Awaited<ReturnType<IBattleTeamRepository['findManyByBattleId']>>
    >()

    for (const battle of battles) {
      const teams = await this.battleTeamRepository.findManyByBattleId(
        battle.id.toString()
      )
      teamsByBattleId.set(battle.id.toString(), teams)

      const opponentTeam = teams.find((t) => t.userId !== userId)
      if (opponentTeam?.userId) opponentUserIds.add(opponentTeam.userId)
    }

    const opponentUsers = await Promise.all(
      [...opponentUserIds].map((id) => this.userRepository.findById(id))
    )
    const opponentNameById = new Map(
      opponentUsers
        .filter((u) => u !== null)
        .map((u) => [u.id.toString(), u.name])
    )

    const historyItems: BattleHistoryItem[] = battles.map((battle) => {
      const battleId = battle.id.toString()
      const teams = teamsByBattleId.get(battleId) ?? []

      const myTeam = teams.find((t) => t.userId === userId)!
      const opponentTeam = teams.find((t) => t.userId !== userId) ?? null

      const outcome: BattleOutcome =
        battle.winnerTerm == null
          ? 'DRAW'
          : battle.winnerTerm === myTeam.teamNumber
            ? 'WIN'
            : 'LOSS'

      return {
        battleId,
        mode: battle.mode,
        status: battle.status,
        createdAt: battle.createdAt,
        totalTurns: battle.totalTurns,
        myTeamNumber: myTeam.teamNumber,
        outcome,
        opponent: {
          userId: opponentTeam?.userId ?? null,
          name: opponentTeam?.userId
            ? (opponentNameById.get(opponentTeam.userId) ?? null)
            : null,
        },
      }
    })

    historyItems.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

    return right({ battles: historyItems })
  }
}
