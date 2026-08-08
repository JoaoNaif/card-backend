import { PrismaCharacterRepository } from '../../../repositories/prisma/prisma-character-repository'
import { CachedCharacterRepository } from '../../../repositories/redis/cached-character-repository'
import { PrismaMachineMemberRepository } from '../../../repositories/prisma/prisma-machine-member-repository'
import { CachedMachineMemberRepository } from '../../../repositories/redis/cached-machine-member-repository'
import { PrismaMachineRepository } from '../../../repositories/prisma/prisma-machine-repository'
import { CachedMachineRepository } from '../../../repositories/redis/cached-machine-repository'
import { PrismaUserRepository } from '../../../repositories/prisma/prisma-user-repository'
import { CreateMachineUseCase } from '../../../use-cases/Battle/create-machine'
import { CreateMachineController } from '../create-machine.controller'

export function makeCreateMachineController(): CreateMachineController {
  const machineRepository = new CachedMachineRepository(new PrismaMachineRepository())
  const machineMemberRepository = new CachedMachineMemberRepository(new PrismaMachineMemberRepository())
  const characterRepository = new CachedCharacterRepository(new PrismaCharacterRepository())
  const userRepository = new PrismaUserRepository()

  const useCase = new CreateMachineUseCase(
    machineRepository,
    machineMemberRepository,
    characterRepository,
    userRepository
  )

  return new CreateMachineController(useCase)
}
