import type { Battle } from '../../entities/battle'

export interface IBattleRepository {
  create(battle: Battle): Promise<void>
  save(battle: Battle): Promise<void>
  delete(battle: Battle): Promise<void>
  findById(id: string): Promise<Battle | null>
  findManyByIds(ids: string[]): Promise<Battle[]>
}
