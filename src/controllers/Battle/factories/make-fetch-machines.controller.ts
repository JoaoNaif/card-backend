import { PrismaCharacterRepository } from '../../../repositories/prisma/prisma-character-repository'
import { CachedCharacterRepository } from '../../../repositories/redis/cached-character-repository'
import { PrismaMachineMemberRepository } from '../../../repositories/prisma/prisma-machine-member-repository'
import { CachedMachineMemberRepository } from '../../../repositories/redis/cached-machine-member-repository'
import { PrismaMachineRepository } from '../../../repositories/prisma/prisma-machine-repository'
import { CachedMachineRepository } from '../../../repositories/redis/cached-machine-repository'
import { PrismaPowerRepository } from '../../../repositories/prisma/prisma-power-repository'
import { CachedPowerRepository } from '../../../repositories/redis/cached-power-repository'
import { FetchMachinesUseCase } from '../../../use-cases/Battle/fetch-machines'
import { FetchMachinesController } from '../fetch-machines.controller'

export function makeFetchMachinesController(): FetchMachinesController {
  const machineRepository = new CachedMachineRepository(new PrismaMachineRepository())
  const machineMemberRepository = new CachedMachineMemberRepository(new PrismaMachineMemberRepository())
  const characterRepository = new CachedCharacterRepository(new PrismaCharacterRepository())
  const powerRepository = new CachedPowerRepository(new PrismaPowerRepository())
  const useCase = new FetchMachinesUseCase(
    machineRepository,
    machineMemberRepository,
    characterRepository,
    powerRepository
  )

  return new FetchMachinesController(useCase)
}
