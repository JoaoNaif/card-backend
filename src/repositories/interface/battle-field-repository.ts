import type { BattleField } from '../../entities/battle-field'

export interface IBattleFieldRepository {
  create(battleField: BattleField): Promise<void>
  findById(id: string): Promise<BattleField | null>
  findByName(name: string): Promise<BattleField | null>
  findRandom(): Promise<BattleField | null>
  findAll(
    search?: string,
    page?: number,
    limit?: number
  ): Promise<BattleField[]>
  save(battleField: BattleField): Promise<void>
  delete(battleField: BattleField): Promise<void>
}
