import { prisma } from '../../config/prisma'
import type { PowerAwakening } from '../../entities/power-awakening'
import type { IPowerAwakeningRepository } from '../interface/power-awakening-repository'
import { PrismaPowerAwakeningMapper } from './mappers/prisma-power-awakening-mapper'

export class PrismaPowerAwakeningRepository implements IPowerAwakeningRepository {
  async create(awakening: PowerAwakening): Promise<void> {
    const data = PrismaPowerAwakeningMapper.toPrisma(awakening)
    await prisma.powerAwakening.create({ data })
  }

  async findByBaseAndAwakened(
    basePowerId: string,
    awakenedPowerId: string
  ): Promise<PowerAwakening | null> {
    const awakening = await prisma.powerAwakening.findFirst({
      where: { basePowerId, awakenedPowerId },
    })

    if (!awakening) return null

    return PrismaPowerAwakeningMapper.toDomain(awakening)
  }

  async findByBasePowerId(basePowerId: string): Promise<PowerAwakening[]> {
    const awakenings = await prisma.powerAwakening.findMany({
      where: { basePowerId },
    })

    return awakenings.map(PrismaPowerAwakeningMapper.toDomain)
  }
}
