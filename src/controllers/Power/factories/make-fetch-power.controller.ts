import { FetchPowerUseCase } from "../../../use-cases/Power/fetch-power"
import { PrismaPowerRepository } from "../../../repositories/prisma/prisma-power-repository"
import { FetchPowerController } from "../fetch-power.controller"

export function makeFetchPowerController(): FetchPowerController {
    const powerRepository = new PrismaPowerRepository()
    const fetchPowerUseCase = new FetchPowerUseCase(powerRepository)
    const fetchPowerController = new FetchPowerController(fetchPowerUseCase)

    return fetchPowerController
}