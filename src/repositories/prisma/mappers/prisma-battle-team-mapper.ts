import { UniqueEntityId } from '../../../core/entities/unique-entity-id'
import { BattleTeam } from '../../../entities/battle-team'
import type { BattleTeam as BattleTeamPrisma } from '../../../generated/prisma'

export class PrismaBattleTeamMapper {
  static toDomain(data: BattleTeamPrisma): BattleTeam {
    return BattleTeam.create(
      {
        battleId: data.battleId,
        teamNumber: data.teamNumber,
        userId: data.userId,
      },
      new UniqueEntityId(data.id)
    )
  }

  static toPrisma(battleTeam: BattleTeam) {
    return {
      id: battleTeam.id.toString(),
      battleId: battleTeam.battleId,
      teamNumber: battleTeam.teamNumber,
      userId: battleTeam.userId ?? null,
    }
  }
}
