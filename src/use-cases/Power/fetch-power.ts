import { right, type Either } from '../../core/either'
import type { IPowerRepository } from '../../repositories/interface/power-repository'
import type { DtoPowerRaw } from './dtos/dto-power-raw'

interface FetchPowerUseCaseRequest {
  search: string
  page: number
  limit: number
}

type FetchPowerUseCaseResponse = Either<
  null,
  {
    powers: DtoPowerRaw[]
  }
>

export class FetchPowerUseCase {
  constructor(private powerRepository: IPowerRepository) {}

  async execute({
    limit,
    page,
    search,
  }: FetchPowerUseCaseRequest): Promise<FetchPowerUseCaseResponse> {
    const powers = await this.powerRepository.findAll(search, page, limit)

    return right({
      powers: powers.map((power) => ({
        id: power.id.toString(),
        name: power.name,
        description: power.description,
        canAwaken: power.canAwaken,
        pillar: power.pillar,
        isAwakened: power.isAwakened,
        createdAt: power.createdAt,
      })),
    })
  }
}
