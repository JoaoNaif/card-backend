import { PrismaPowerRepository } from '../../../repositories/prisma/prisma-power-repository'
import { CachedPowerRepository } from '../../../repositories/redis/cached-power-repository'
import { PrismaUserRepository } from '../../../repositories/prisma/prisma-user-repository'
import { EditPowerUseCase } from '../../../use-cases/Power/edit-power'
import { EditPowerController } from '../edit-power.controller'

export function makeEditPowerController(): EditPowerController {
  const powerRepository = new CachedPowerRepository(new PrismaPowerRepository())
  const userRepository = new PrismaUserRepository()
  const editPowerUseCase = new EditPowerUseCase(userRepository, powerRepository)
  const editPowerController = new EditPowerController(editPowerUseCase)

  return editPowerController
}
