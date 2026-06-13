import { prisma } from '../../config/prisma'
import type { BattleField } from '../../entities/battle-field'
import type { IBattleFieldRepository } from '../interface/battle-field-repository'
import { PrismaBattleFieldMapper } from './mappers/prisma-battle-field-mapper'

const withModifiers = {
  modifiers: { include: { trait: true } },
} as const

export class PrismaBattleFieldRepository implements IBattleFieldRepository {
  async create(battleField: BattleField): Promise<void> {
    await prisma.battleField.create({
      data: {
        id: battleField.id.toString(),
        name: battleField.name,
        description: battleField.description,
        createdAt: battleField.createdAt,
        modifiers: {
          create: battleField.modifiers.map((m) => ({
            id: m.id,
            traitId: m.traitId,
            stat: m.stat as never,
            bonusType: m.bonusType as never,
            bonusValue: m.bonusValue,
          })),
        },
      },
    })
  }

  async findById(id: string): Promise<BattleField | null> {
    const data = await prisma.battleField.findUnique({
      where: { id },
      include: withModifiers,
    })
    if (!data) return null
    return PrismaBattleFieldMapper.toDomain(data)
  }

  async findByName(name: string): Promise<BattleField | null> {
    const data = await prisma.battleField.findUnique({
      where: { name },
      include: withModifiers,
    })
    if (!data) return null
    return PrismaBattleFieldMapper.toDomain(data)
  }

  async findRandom(): Promise<BattleField | null> {
    const count = await prisma.battleField.count()
    if (count === 0) return null
    const skip = Math.floor(Math.random() * count)
    const data = await prisma.battleField.findFirst({
      skip,
      include: withModifiers,
    })
    if (!data) return null
    return PrismaBattleFieldMapper.toDomain(data)
  }

  async findAll(search = '', page = 1, limit = 20): Promise<BattleField[]> {
    const data = await prisma.battleField.findMany({
      where: { name: { contains: search, mode: 'insensitive' } },
      take: limit,
      skip: (page - 1) * limit,
      include: withModifiers,
    })
    return data.map(PrismaBattleFieldMapper.toDomain)
  }
}
