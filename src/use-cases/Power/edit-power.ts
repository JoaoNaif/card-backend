import { left, right, type Either } from '../../core/either'
import { ResourceAlreadyExistError } from '../../core/error/err/resource-already-exist-error'
import type { IUserRepository } from '../../repositories/interface/user-repository'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'
import type { Pillar } from '../../entities/power'
import type { IPowerRepository } from '../../repositories/interface/power-repository'
import { UnauthorizedError } from '../../core/error/err/unauthorized-error'

interface EditPowerUseCaseRequest {
  adminId: string
  powerId: string
  name?: string
  description?: string
  pillar?: Pillar
}

type EditPowerUseCaseResponse = Either<
  ResourceAlreadyExistError | ResourceNotFoundError | UnauthorizedError,
  null
>
export class EditPowerUseCase {
  constructor(
    private userRepository: IUserRepository,
    private powerRepository: IPowerRepository
  ) {}

  async execute({
    adminId,
    powerId,
    name,
    description,
    pillar,
  }: EditPowerUseCaseRequest): Promise<EditPowerUseCaseResponse> {
    const user = await this.userRepository.findById(adminId)

    if (!user) return left(new ResourceNotFoundError('User'))

    if (!user.isAdmin()) return left(new UnauthorizedError())

    const power = await this.powerRepository.findById(powerId)

    if (!power) return left(new ResourceNotFoundError('Power'))

    if (name) {
      const newName = await this.powerRepository.findByName(name)

      if (newName) return left(new ResourceAlreadyExistError('Name'))

      power.name = name
    }

    power.description = description ?? power.description
    power.pillar = pillar ?? power.pillar

    await this.powerRepository.save(power)

    return right(null)
  }
}
