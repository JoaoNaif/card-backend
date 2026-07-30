import { PrismaMachineMemberRepository } from '../../../repositories/prisma/prisma-machine-member-repository'
import { PrismaMachineRepository } from '../../../repositories/prisma/prisma-machine-repository'
import { FetchMachinesUseCase } from '../../../use-cases/Battle/fetch-machines'
import { FetchMachinesController } from '../fetch-machines.controller'

export function makeFetchMachinesController(): FetchMachinesController {
  const machineRepository = new PrismaMachineRepository()
  const machineMemberRepository = new PrismaMachineMemberRepository()
  const useCase = new FetchMachinesUseCase(
    machineRepository,
    machineMemberRepository
  )

  return new FetchMachinesController(useCase)
}
