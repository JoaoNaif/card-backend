import { PrismaPowerRepository } from '../../../repositories/prisma/prisma-power-repository'
import { CachedPowerRepository } from '../../../repositories/redis/cached-power-repository'
import { GetPowerNameUseCase } from '../../../use-cases/Power/get-power-name'
import { GetPowerNameController } from '../get-power-name.controller'

export function makeGetPowerNameController(): GetPowerNameController {
  const powerRepository = new CachedPowerRepository(new PrismaPowerRepository())
  const getPowerNameUseCase = new GetPowerNameUseCase(powerRepository)
  const getPowerNameController = new GetPowerNameController(getPowerNameUseCase)

  return getPowerNameController
}
