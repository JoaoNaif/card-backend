import { UniqueEntityId } from '../../../core/entities/unique-entity-id'
import { BattleParticipant } from '../../../entities/battle-participant'
import type { BattleParticipant as BattleParticipantPrisma } from '../../../generated/prisma'

export class PrismaBattleParticipantMapper {
  static toDomain(data: BattleParticipantPrisma): BattleParticipant {
    return BattleParticipant.create(
      {
        battleTeamId: data.battleTeamId,
        characterId: data.characterId,
        positionRow: data.positionRow,
        positionCol: data.positionCol,
      },
      new UniqueEntityId(data.id)
    )
  }

  static toPrisma(participant: BattleParticipant) {
    return {
      id: participant.id.toString(),
      battleTeamId: participant.battleTeamId,
      characterId: participant.characterId,
      positionRow: participant.positionRow,
      positionCol: participant.positionCol,
    }
  }
}
