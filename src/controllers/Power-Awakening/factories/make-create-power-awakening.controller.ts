import { PrismaPowerAwakeningRepository } from '../../../repositories/prisma/prisma-power-awakening-repository'
import { PrismaPowerRepository } from '../../../repositories/prisma/prisma-power-repository'
import { PrismaUserRepository } from '../../../repositories/prisma/prisma-user-repository'
import { PowerAwakeningUseCase } from '../../../use-cases/Power-Awakening/create-power-awakening'
import { PowerAwakeningController } from '../create-power-awakening.controller'

export function makePowerAwakeningController(): PowerAwakeningController {
  const powerAwakeningRepository = new PrismaPowerAwakeningRepository()
  const powerRepository = new PrismaPowerRepository()
  const userRepository = new PrismaUserRepository()
  const powerAwakeningController = new PowerAwakeningUseCase(
    powerAwakeningRepository,
    powerRepository,
    userRepository
  )

  return new PowerAwakeningController(powerAwakeningController)
}
