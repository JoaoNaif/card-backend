import type { Power } from "../../generated/prisma"
import type { IPowerRepository } from "../../repositories/interface/power-repository"

interface CreatePowerUseCaseRequest {
    name: string
    description: string
}

interface CreatePowerUseCaseResponse {
    power: Power
}

export class CreatePowerUseCase {
    constructor(private powerRepository: IPowerRepository) { }

    async execute({
        name,
        description
    }: CreatePowerUseCaseRequest): Promise<CreatePowerUseCaseResponse> {
        const powerAlreadyExists = await this.powerRepository.findByName(name)

        if (powerAlreadyExists) {
            throw new Error('Power already exists')
        }

        const power = await this.powerRepository.create({ name, description })

        return {
            power
        }
    }
}
