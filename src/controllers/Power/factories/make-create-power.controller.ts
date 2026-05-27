import { PrismaPowerRepository } from "../../../repositories/prisma/prisma-power-repository";
import { CreatePowerUseCase } from "../../../use-cases/Power/create-power";
import { CreatePowerController } from "../create-power.controller";

export function makeCreatePowerController(): CreatePowerController {
    const powerRepository = new PrismaPowerRepository();
    const createPowerUseCase = new CreatePowerUseCase(powerRepository);
    const createPowerController = new CreatePowerController(createPowerUseCase);

    return createPowerController;
}