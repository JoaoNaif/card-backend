import { PrismaPowerRepository } from '../../../repositories/prisma/prisma-power-repository'
import { PrismaUserRepository } from '../../../repositories/prisma/prisma-user-repository'
import { CreatePowerUseCase } from '../../../use-cases/Power/create-power'
import { CreatePowerController } from '../create-power.controller'

export function makeCreatePowerController(): CreatePowerController {
  const powerRepository = new PrismaPowerRepository()
  const userRepository = new PrismaUserRepository()
  const createPowerUseCase = new CreatePowerUseCase(
    powerRepository,
    userRepository
  )
  const createPowerController = new CreatePowerController(createPowerUseCase)

  return createPowerController
}
