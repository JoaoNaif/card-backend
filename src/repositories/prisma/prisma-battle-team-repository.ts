import { prisma } from '../../config/prisma'
import type { BattleTeam } from '../../entities/battle-team'
import type { IBattleTeamRepository } from '../interface/battle-team-repository'
import { PrismaBattleTeamMapper } from './mappers/prisma-battle-team-mapper'

export class PrismaBattleTeamRepository implements IBattleTeamRepository {
  async create(battleTeam: BattleTeam): Promise<void> {
    await prisma.battleTeam.create({
      data: PrismaBattleTeamMapper.toPrisma(battleTeam),
    })
  }

  async save(battleTeam: BattleTeam): Promise<void> {
    await prisma.battleTeam.update({
      where: { id: battleTeam.id.toString() },
      data: PrismaBattleTeamMapper.toPrisma(battleTeam),
    })
  }

  async delete(battleTeam: BattleTeam): Promise<void> {
    await prisma.battleTeam.delete({
      where: { id: battleTeam.id.toString() },
    })
  }

  async findById(id: string): Promise<BattleTeam | null> {
    const data = await prisma.battleTeam.findUnique({ where: { id } })
    if (!data) return null
    return PrismaBattleTeamMapper.toDomain(data)
  }
}
