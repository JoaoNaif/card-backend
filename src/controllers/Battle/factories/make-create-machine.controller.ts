import { PrismaCharacterRepository } from '../../../repositories/prisma/prisma-character-repository'
import { PrismaMachineMemberRepository } from '../../../repositories/prisma/prisma-machine-member-repository'
import { PrismaMachineRepository } from '../../../repositories/prisma/prisma-machine-repository'
import { PrismaUserRepository } from '../../../repositories/prisma/prisma-user-repository'
import { CreateMachineUseCase } from '../../../use-cases/Battle/create-machine'
import { CreateMachineController } from '../create-machine.controller'

export function makeCreateMachineController(): CreateMachineController {
  const machineRepository = new PrismaMachineRepository()
  const machineMemberRepository = new PrismaMachineMemberRepository()
  const characterRepository = new PrismaCharacterRepository()
  const userRepository = new PrismaUserRepository()

  const useCase = new CreateMachineUseCase(
    machineRepository,
    machineMemberRepository,
    characterRepository,
    userRepository
  )

  return new CreateMachineController(useCase)
}
