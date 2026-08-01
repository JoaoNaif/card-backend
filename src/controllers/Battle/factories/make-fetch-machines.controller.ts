import { PrismaCharacterRepository } from '../../../repositories/prisma/prisma-character-repository'
import { PrismaMachineMemberRepository } from '../../../repositories/prisma/prisma-machine-member-repository'
import { PrismaMachineRepository } from '../../../repositories/prisma/prisma-machine-repository'
import { PrismaPowerRepository } from '../../../repositories/prisma/prisma-power-repository'
import { FetchMachinesUseCase } from '../../../use-cases/Battle/fetch-machines'
import { FetchMachinesController } from '../fetch-machines.controller'

export function makeFetchMachinesController(): FetchMachinesController {
  const machineRepository = new PrismaMachineRepository()
  const machineMemberRepository = new PrismaMachineMemberRepository()
  const characterRepository = new PrismaCharacterRepository()
  const powerRepository = new PrismaPowerRepository()
  const useCase = new FetchMachinesUseCase(
    machineRepository,
    machineMemberRepository,
    characterRepository,
    powerRepository
  )

  return new FetchMachinesController(useCase)
}
