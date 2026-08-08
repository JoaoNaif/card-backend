import { FetchPowerUseCase } from "../../../use-cases/Power/fetch-power"
import { PrismaPowerRepository } from "../../../repositories/prisma/prisma-power-repository"
import { CachedPowerRepository } from "../../../repositories/redis/cached-power-repository"
import { FetchPowerController } from "../fetch-power.controller"

export function makeFetchPowerController(): FetchPowerController {
    const powerRepository = new CachedPowerRepository(new PrismaPowerRepository())
    const fetchPowerUseCase = new FetchPowerUseCase(powerRepository)
    const fetchPowerController = new FetchPowerController(fetchPowerUseCase)

    return fetchPowerController
}