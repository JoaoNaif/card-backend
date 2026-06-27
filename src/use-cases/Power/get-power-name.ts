import { left, right, type Either } from '../../core/either'
import { ResourceAlreadyExistError } from '../../core/error/err/resource-already-exist-error'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'
import type { IPowerRepository } from '../../repositories/interface/power-repository'
import { UnauthorizedError } from '../../core/error/err/unauthorized-error'
import type { DtoPowerRaw } from './dtos/dto-power-raw'

interface GetPowerNameUseCaseRequest {
  name: string
}

type GetPowerNameUseCaseResponse = Either<
  ResourceAlreadyExistError | ResourceNotFoundError | UnauthorizedError,
  {
    power: DtoPowerRaw
  }
>
export class GetPowerNameUseCase {
  constructor(private powerRepository: IPowerRepository) {}

  async execute({
    name,
  }: GetPowerNameUseCaseRequest): Promise<GetPowerNameUseCaseResponse> {
    const power = await this.powerRepository.findByName(name)

    if (!power) return left(new ResourceNotFoundError('Power'))

    return right({
      power: {
        id: power.id.toString(),
        name: power.name,
        description: power.description,
        canAwaken: power.canAwaken,
        pillar: power.pillar,
        isAwakened: power.isAwakened,
        createdAt: power.createdAt,
      },
    })
  }
}
