import { left, right, type Either } from '../../core/either'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'
import { ResourceAlreadyExistError } from '../../core/error/err/resource-already-exist-error'
import { UnauthorizedError } from '../../core/error/err/unauthorized-error'
import { Power } from '../../entities/power'
import type { IPowerRepository } from '../../repositories/interface/power-repository'
import type { IUserRepository } from '../../repositories/interface/user-repository'
import type { DtoPowerRaw } from './dtos/dto-power-raw'

interface CreatePowerUseCaseRequest {
  userId: string
  name: string
  description: string
}

type CreatePowerUseCaseResponse = Either<
  ResourceAlreadyExistError | UnauthorizedError,
  {
    power: DtoPowerRaw
  }
>

export class CreatePowerUseCase {
  constructor(
    private powerRepository: IPowerRepository,
    private userRepository: IUserRepository
  ) {}

  async execute({
    userId,
    name,
    description,
  }: CreatePowerUseCaseRequest): Promise<CreatePowerUseCaseResponse> {
    const user = await this.userRepository.findById(userId)

    if (!user) {
      return left(new ResourceNotFoundError('User'))
    }

    if (!user.isAdmin()) {
      return left(new UnauthorizedError())
    }

    const powerAlreadyExists = await this.powerRepository.findByName(name)

    if (powerAlreadyExists) {
      return left(new ResourceAlreadyExistError('Power'))
    }

    const power = Power.create({
      name,
      description,
    })

    await this.powerRepository.create(power)

    return right({
      power: {
        id: power.id.toString(),
        name: power.name,
        description: power.description,
        createAt: power.createdAt,
      },
    })
  }
}
