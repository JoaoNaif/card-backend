import { left, right, type Either } from '../../core/either'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'
import { UnauthorizedError } from '../../core/error/err/unauthorized-error'
import { BattleMode, BattleStatus } from '../../entities/battle'
import type { IBattleFieldRepository } from '../../repositories/interface/battle-field-repository'
import type { IBattleRepository } from '../../repositories/interface/battle-repository'
import type { IBattleTeamRepository } from '../../repositories/interface/battle-team-repository'
import type { IPveSessionRepository } from '../../repositories/interface/pve-session-repository'
import { submitPlayerAction } from './engine/pve-engine'
import {
  buildSkillNames,
  buildStateDto,
  flattenActions,
  type PveStateDto,
} from './engine/pve-response'
import type { ActionLog } from './engine/types'
import { InvalidBattleActionError } from './err/invalid-battle-action-error'

interface SubmitPveActionUseCaseRequest {
  userId: string
  battleId: string
  characterId: string
  skillId: string
  targetId?: string
}

interface SubmitPveActionUseCaseResponse {
  battleId: string
  skillNames: Record<string, string>
  actions: ActionLog[]
  state: PveStateDto
}

type SubmitPveActionResponse = Either<
  ResourceNotFoundError | UnauthorizedError | InvalidBattleActionError,
  SubmitPveActionUseCaseResponse
>

export class SubmitPveActionUseCase {
  constructor(
    private battleRepository: IBattleRepository,
    private battleTeamRepository: IBattleTeamRepository,
    private battleFieldRepository: IBattleFieldRepository,
    private pveSessionRepository: IPveSessionRepository
  ) {}

  async execute({
    userId,
    battleId,
    characterId,
    skillId,
    targetId,
  }: SubmitPveActionUseCaseRequest): Promise<SubmitPveActionResponse> {
    const battle = await this.battleRepository.findById(battleId)
    if (!battle) return left(new ResourceNotFoundError('Battle'))

    if (battle.mode !== BattleMode.PVE) {
      return left(new InvalidBattleActionError('This battle is not a PvE battle.'))
    }
    if (battle.status !== BattleStatus.ACTIVE) {
      return left(new InvalidBattleActionError('This battle has already ended.'))
    }

    const teams = await this.battleTeamRepository.findManyByBattleId(battleId)
    const playerTeam = teams.find((t) => t.teamNumber === 1)
    if (!playerTeam || playerTeam.userId !== userId) {
      return left(new UnauthorizedError())
    }

    const state = await this.pveSessionRepository.find(battleId)
    if (!state) {
      return left(new InvalidBattleActionError('Battle session state is missing.'))
    }

    const battleField = await this.battleFieldRepository.findById(battle.battleFieldId)
    if (!battleField) return left(new ResourceNotFoundError('Battle Field'))

    const result = submitPlayerAction(state, {
      characterId,
      skillId,
      ...(targetId !== undefined ? { targetId } : {}),
    })
    if (result.isLeft()) return left(result.value)

    const { state: newState, completedRounds } = result.value

    battle.log = [
      ...battle.log,
      ...completedRounds.map((round) => JSON.stringify(round)),
    ]
    battle.totalTurns = battle.totalTurns + completedRounds.length
    battle.status =
      newState.status === 'FINISHED' ? BattleStatus.COMPLETED : BattleStatus.ACTIVE
    battle.winnerTerm = newState.winnerTeam
    battle.updatedAt = new Date()

    await this.battleRepository.save(battle)

    if (newState.status === 'FINISHED') {
      await this.pveSessionRepository.delete(battleId)
    } else {
      await this.pveSessionRepository.save(battleId, newState)
    }

    return right({
      battleId: battle.id.toString(),
      skillNames: buildSkillNames(newState),
      actions: flattenActions(completedRounds, newState),
      state: buildStateDto(newState, {
        id: battleField.id.toString(),
        name: battleField.name,
        description: battleField.description,
        modifiers: battleField.modifiers,
      }),
    })
  }
}
