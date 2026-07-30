import { prisma } from '../../config/prisma'
import type { MachineMember } from '../../entities/machine-member'
import type { IMachineMemberRepository } from '../interface/machine-member-repository'
import { PrismaMachineMemberMapper } from './mappers/prisma-machine-member-mapper'

export class PrismaMachineMemberRepository implements IMachineMemberRepository {
  async create(machineMember: MachineMember): Promise<void> {
    await prisma.machineMember.create({
      data: PrismaMachineMemberMapper.toPrisma(machineMember),
    })
  }

  async findAllByMachineId(machineId: string): Promise<MachineMember[]> {
    const data = await prisma.machineMember.findMany({ where: { machineId } })
    return data.map(PrismaMachineMemberMapper.toDomain)
  }
}
