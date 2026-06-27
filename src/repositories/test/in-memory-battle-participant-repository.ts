import type { BattleParticipant } from '../../entities/battle-participant'
import type { IBattleParticipantRepository } from '../interface/battle-participant-repository'

export class InMemoryBattleParticipantRepository
  implements IBattleParticipantRepository
{
  public items: BattleParticipant[] = []

  async create(battleParticipant: BattleParticipant): Promise<void> {
    this.items.push(battleParticipant)
  }

  async save(battleParticipant: BattleParticipant): Promise<void> {
    const index = this.items.findIndex((p) => p.id.equals(battleParticipant.id))
    if (index >= 0) {
      this.items[index] = battleParticipant
    }
  }

  async delete(battleParticipant: BattleParticipant): Promise<void> {
    this.items = this.items.filter((p) => !p.id.equals(battleParticipant.id))
  }

  async findById(id: string): Promise<BattleParticipant | null> {
    return this.items.find((p) => p.id.toString() === id) ?? null
  }
}
