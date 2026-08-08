import { redis } from '../../config/redis'
import type { PveSessionState } from '../../use-cases/Battle/engine/pve-engine'
import type { IPveSessionRepository } from '../interface/pve-session-repository'

const SESSION_TTL_SECONDS = 30 * 60

function sessionKey(battleId: string): string {
  return `pve-session:${battleId}`
}

export class RedisPveSessionRepository implements IPveSessionRepository {
  async save(battleId: string, state: PveSessionState): Promise<void> {
    await redis.set(
      sessionKey(battleId),
      JSON.stringify(state),
      'EX',
      SESSION_TTL_SECONDS
    )
  }

  async find(battleId: string): Promise<PveSessionState | null> {
    const raw = await redis.get(sessionKey(battleId))
    return raw ? (JSON.parse(raw) as PveSessionState) : null
  }

  async delete(battleId: string): Promise<void> {
    await redis.del(sessionKey(battleId))
  }
}
