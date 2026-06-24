import { prisma } from '../../config/prisma'
import type { Battle } from '../../entities/battle'
import type { IBattleRepository } from '../interface/battle-repository'
import { PrismaBattleMapper } from './mappers/prisma-battle-mapper'

export class PrismaBattleRepository implements IBattleRepository {
  async create(battle: Battle): Promise<void> {
    const data = PrismaBattleMapper.toPrisma(battle)

    await prisma.battle.create({
      data,
    })
  }

  async save(battle: Battle): Promise<void> {
    const id = battle.id.toString()
    await prisma.battle.update({
      where: { id },
      data: PrismaBattleMapper.toPrismaUpdate(battle),
    })
  }

  async delete(battle: Battle): Promise<void> {
    const id = battle.id.toString()
    await prisma.battle.delete({
      where: { id },
    })
  }

  async findById(id: string): Promise<Battle | null> {
    const data = await prisma.battle.findUnique({
      where: { id },
    })

    if (!data) {
      return null
    }

    return PrismaBattleMapper.toDomain(data)
  }
}
