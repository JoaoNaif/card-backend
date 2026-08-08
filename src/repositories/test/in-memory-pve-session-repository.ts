import type { PveSessionState } from '../../use-cases/Battle/engine/pve-engine'
import type { IPveSessionRepository } from '../interface/pve-session-repository'

export class InMemoryPveSessionRepository implements IPveSessionRepository {
  public items: Map<string, PveSessionState> = new Map()

  async save(battleId: string, state: PveSessionState): Promise<void> {
    this.items.set(battleId, state)
  }

  async find(battleId: string): Promise<PveSessionState | null> {
    return this.items.get(battleId) ?? null
  }

  async delete(battleId: string): Promise<void> {
    this.items.delete(battleId)
  }
}
