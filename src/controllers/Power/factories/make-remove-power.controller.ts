import { PrismaPowerRepository } from '../../../repositories/prisma/prisma-power-repository'
import { PrismaUserRepository } from '../../../repositories/prisma/prisma-user-repository'
import { RemovePowerUseCase } from '../../../use-cases/Power/remove-power'
import { RemovePowerController } from '../remove-power.controller'

export function makeRemovePowerController(): RemovePowerController {
  const powerRepository = new PrismaPowerRepository()
  const userRepository = new PrismaUserRepository()
  const removePowerUseCase = new RemovePowerUseCase(
    userRepository,
    powerRepository
  )
  const removePowerController = new RemovePowerController(removePowerUseCase)

  return removePowerController
}
