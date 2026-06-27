import type { BattleParticipant } from '../../entities/battle-participant'

export interface IBattleParticipantRepository {
  create(battleParticipant: BattleParticipant): Promise<void>
  save(battleParticipant: BattleParticipant): Promise<void>
  delete(battleParticipant: BattleParticipant): Promise<void>
  findById(id: string): Promise<BattleParticipant | null>
}
