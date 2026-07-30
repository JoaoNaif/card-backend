import { prisma } from '../../config/prisma'
import type { Machine } from '../../entities/machine'
import type { IMachineRepository } from '../interface/machine-repository'
import { PrismaMachineMapper } from './mappers/prisma-machine-mapper'

export class PrismaMachineRepository implements IMachineRepository {
  async create(machine: Machine): Promise<void> {
    await prisma.machine.create({
      data: PrismaMachineMapper.toPrisma(machine),
    })
  }

  async findByLabel(label: string): Promise<Machine | null> {
    const data = await prisma.machine.findUnique({ where: { label } })
    if (!data) return null
    return PrismaMachineMapper.toDomain(data)
  }

  async findById(id: string): Promise<Machine | null> {
    const data = await prisma.machine.findUnique({ where: { id } })
    if (!data) return null
    return PrismaMachineMapper.toDomain(data)
  }

  async findAll(): Promise<Machine[]> {
    const data = await prisma.machine.findMany()
    return data.map(PrismaMachineMapper.toDomain)
  }
}
