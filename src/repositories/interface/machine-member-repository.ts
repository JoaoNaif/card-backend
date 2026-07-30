import type { MachineMember } from '../../entities/machine-member'

export interface IMachineMemberRepository {
  create(machineMember: MachineMember): Promise<void>
  findAllByMachineId(machineId: string): Promise<MachineMember[]>
}
