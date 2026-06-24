import { left, right, type Either } from '../../core/either'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'
import { Battle, BattleMode, BattleStatus } from '../../entities/battle'
import type { IBattleFieldRepository } from '../../repositories/interface/battle-field-repository'
import type { IBattleRepository } from '../../repositories/interface/battle-repository'
import type { DtoBattleRaw } from './dtos/dto-battle-raw'

interface CreateBattleUseCaseRequest {
  mode: BattleMode
  battleFieldId: string
  winnerTerm?: number | null | undefined
  totalTurns?: number | null | undefined
  maxTurns?: number | null | undefined
  log: string[]
  sessionState?: string[] | null | undefined
}

type CreateBattleUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    battle: DtoBattleRaw
  }
>

export class CreateBattleUseCase {
  constructor(
    private battleRepository: IBattleRepository,
    private battleFieldRepository: IBattleFieldRepository
  ) {}

  async execute({
    battleFieldId,
    log,
    mode,
    maxTurns,
    sessionState,
    totalTurns,
    winnerTerm,
  }: CreateBattleUseCaseRequest): Promise<CreateBattleUseCaseResponse> {
    const battleField = await this.battleFieldRepository.findById(battleFieldId)

    if (!battleField) return left(new ResourceNotFoundError('Battle Field'))

    let battleStatus = BattleStatus.COMPLETED

    if (mode !== BattleMode.AUTO) {
      battleStatus = BattleStatus.ACTIVE
    }

    const battle = Battle.create({
      mode,
      battleFieldId,
      status: battleStatus,
      log,
      maxTurns,
      sessionState,
      totalTurns: totalTurns ?? 0,
      winnerTerm,
    })

    await this.battleRepository.create(battle)

    return right({
      battle: {
        id: battle.id.toString(),
        battleFieldId: battle.battleFieldId,
        mode: battle.mode,
        log: battle.log,
        maxTurns: battle.maxTurns,
        sessionState: battle.sessionState,
        totalTurns: battle.totalTurns,
        winnerTerm: battle.winnerTerm,
        updatedAt: battle.updatedAt,
        createdAt: battle.createdAt,
      },
    })
  }
}
