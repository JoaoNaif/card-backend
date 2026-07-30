import { PrismaMachineMemberRepository } from '../../../repositories/prisma/prisma-machine-member-repository'
import { PrismaMachineRepository } from '../../../repositories/prisma/prisma-machine-repository'
import { GetMachineTeamUseCase } from '../../../use-cases/Battle/get-machine-team'
import { GetMachineTeamController } from '../get-machine-team.controller'

export function makeGetMachineTeamController(): GetMachineTeamController {
  const machineRepository = new PrismaMachineRepository()
  const machineMemberRepository = new PrismaMachineMemberRepository()
  const useCase = new GetMachineTeamUseCase(
    machineRepository,
    machineMemberRepository
  )

  return new GetMachineTeamController(useCase)
}
