import { prisma } from '../../config/prisma'
import type { BattleParticipant } from '../../entities/battle-participant'
import type { IBattleParticipantRepository } from '../interface/battle-participant-repository'
import { PrismaBattleParticipantMapper } from './mappers/prisma-battle-participant-mapper'

export class PrismaBattleParticipantRepository
  implements IBattleParticipantRepository
{
  async create(battleParticipant: BattleParticipant): Promise<void> {
    await prisma.battleParticipant.create({
      data: PrismaBattleParticipantMapper.toPrisma(battleParticipant),
    })
  }

  async save(battleParticipant: BattleParticipant): Promise<void> {
    await prisma.battleParticipant.update({
      where: { id: battleParticipant.id.toString() },
      data: PrismaBattleParticipantMapper.toPrisma(battleParticipant),
    })
  }

  async delete(battleParticipant: BattleParticipant): Promise<void> {
    await prisma.battleParticipant.delete({
      where: { id: battleParticipant.id.toString() },
    })
  }

  async findById(id: string): Promise<BattleParticipant | null> {
    const data = await prisma.battleParticipant.findUnique({ where: { id } })
    if (!data) return null
    return PrismaBattleParticipantMapper.toDomain(data)
  }
}
