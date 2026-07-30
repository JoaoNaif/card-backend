import type { BattleTeam } from '../../entities/battle-team'

export interface IBattleTeamRepository {
  create(battleTeam: BattleTeam): Promise<void>
  save(battleTeam: BattleTeam): Promise<void>
  delete(battleTeam: BattleTeam): Promise<void>
  findById(id: string): Promise<BattleTeam | null>
  findManyByUserId(userId: string): Promise<BattleTeam[]>
}
