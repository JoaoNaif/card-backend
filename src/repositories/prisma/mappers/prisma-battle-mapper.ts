import { UniqueEntityId } from '../../../core/entities/unique-entity-id'
import {
  Battle,
  type BattleStatus,
  type BattleMode,
} from '../../../entities/battle'
import type { Battle as BattlePrisma } from '../../../generated/prisma'

export class PrismaBattleMapper {
  static toDomain(battle: BattlePrisma): Battle {
    return Battle.create(
      {
        mode: battle.mode as BattleMode,
        battleFieldId: battle.battleFieldId,
        status: battle.status as BattleStatus,
        log: battle.log as string[],
        maxTurns: battle.maxTurns,
        totalTurns: battle.totalTurns,
        winnerTerm: battle.winnerTeam,
        updatedAt: battle.updatedAt,
        createdAt: battle.createdAt,
      },
      new UniqueEntityId(battle.id)
    )
  }

  static toPrisma(battle: Battle) {
    return {
      id: battle.id.toString(),
      mode: battle.mode,
      status: battle.status,
      battleFieldId: battle.battleFieldId,
      winnerTeam: battle.winnerTerm ?? null,
      totalTurns: battle.totalTurns,
      maxTurns: battle.maxTurns ?? null,
      log: battle.log,
      createdAt: battle.createdAt,
      updatedAt: battle.updatedAt,
    }
  }

  static toPrismaUpdate(battle: Battle) {
    return {
      mode: battle.mode,
      status: battle.status,
      battleFieldId: battle.battleFieldId,
      winnerTeam: battle.winnerTerm ?? null,
      totalTurns: battle.totalTurns,
      maxTurns: battle.maxTurns ?? null,
      log: battle.log,
      createdAt: battle.createdAt,
      updatedAt: battle.updatedAt,
    }
  }
}
