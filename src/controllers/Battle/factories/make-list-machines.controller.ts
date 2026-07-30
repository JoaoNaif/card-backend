import { PrismaMachineMemberRepository } from '../../../repositories/prisma/prisma-machine-member-repository'
import { PrismaMachineRepository } from '../../../repositories/prisma/prisma-machine-repository'
import { ListMachinesUseCase } from '../../../use-cases/Battle/list-machines'
import { ListMachinesController } from '../list-machines.controller'

export function makeListMachinesController(): ListMachinesController {
  const machineRepository = new PrismaMachineRepository()
  const machineMemberRepository = new PrismaMachineMemberRepository()
  const useCase = new ListMachinesUseCase(machineRepository, machineMemberRepository)

  return new ListMachinesController(useCase)
}
