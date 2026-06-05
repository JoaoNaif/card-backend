import { prisma } from '../../config/prisma'
import type { Power } from '../../entities/power'
import type { IPowerRepository } from '../interface/power-repository'
import { PrismaPowerMapper } from './mappers/prisma-power-mapper'

export class PrismaPowerRepository implements IPowerRepository {
  async findByName(name: string): Promise<Power | null> {
    const data = await prisma.power.findUnique({
      where: { name },
    })

    if (!data) {
      return null
    }

    return PrismaPowerMapper.toDomain(data)
  }

  async findById(id: string): Promise<Power | null> {
    const data = await prisma.power.findUnique({
      where: { id },
    })

    if (!data) {
      return null
    }

    return PrismaPowerMapper.toDomain(data)
  }

  async findAll(search: string, page: number, limit: number): Promise<Power[]> {
    const data = await prisma.power.findMany({
      where: { name: { contains: search } },
      take: limit,
      skip: (page - 1) * limit,
    })

    return data.map(PrismaPowerMapper.toDomain)
  }

  async create(power: Power): Promise<void> {
    const data = PrismaPowerMapper.toPrisma(power)

    await prisma.power.create({
      data,
    })
  }

  async save(power: Power): Promise<void> {
    const id = power.id.toString()
    await prisma.power.update({
      where: { id },
      data: PrismaPowerMapper.toPrismaUpdate(power),
    })
  }

  async delete(power: Power): Promise<void> {
    const id = power.id.toString()
    await prisma.power.delete({
      where: { id },
    })
  }
}
