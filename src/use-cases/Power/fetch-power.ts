import type { Power } from "../../generated/prisma"
import type { IPowerRepository } from "../../repositories/interface/power-repository"

interface FetchPowerRequest {
    search: string
    page: number
    limit: number
}

interface FetchPowerResponse {
    powers: Power[]
}

export class FetchPowerUseCase {
    constructor(private powerRepository: IPowerRepository) { }

    async execute(request: FetchPowerRequest): Promise<FetchPowerResponse> {
        const { search, page, limit } = request

        const powers = await this.powerRepository.findAll(
            search,
            page,
            limit
        )

        return { powers }
    }
}