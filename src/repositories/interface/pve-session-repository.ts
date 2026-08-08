import type { PveSessionState } from '../../use-cases/Battle/engine/pve-engine'

export interface IPveSessionRepository {
  save(battleId: string, state: PveSessionState): Promise<void>
  find(battleId: string): Promise<PveSessionState | null>
  delete(battleId: string): Promise<void>
}
