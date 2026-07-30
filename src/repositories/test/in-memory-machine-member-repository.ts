import type { MachineMember } from '../../entities/machine-member'
import type { IMachineMemberRepository } from '../interface/machine-member-repository'

export class InMemoryMachineMemberRepository
  implements IMachineMemberRepository
{
  public items: MachineMember[] = []

  async create(machineMember: MachineMember): Promise<void> {
    this.items.push(machineMember)
  }

  async findAllByMachineId(machineId: string): Promise<MachineMember[]> {
    return this.items.filter((m) => m.machineId === machineId)
  }
}
