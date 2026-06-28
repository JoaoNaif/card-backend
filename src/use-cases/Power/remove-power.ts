import { left, right, type Either } from '../../core/either'
import type { IUserRepository } from '../../repositories/interface/user-repository'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'
import { UnauthorizedError } from '../../core/error/err/unauthorized-error'
import type { IPowerRepository } from '../../repositories/interface/power-repository'

interface RemovePowerUseCaseRequest {
  powerId: string
  adminId: string
}

type RemovePowerUseCaseResponse = Either<
  ResourceNotFoundError | UnauthorizedError,
  null
>
export class RemovePowerUseCase {
  constructor(
    private userRepository: IUserRepository,
    private powerRepository: IPowerRepository
  ) {}

  async execute({
    adminId,
    powerId,
  }: RemovePowerUseCaseRequest): Promise<RemovePowerUseCaseResponse> {
    const user = await this.userRepository.findById(adminId)

    if (!user) return left(new ResourceNotFoundError('Email'))

    if (!user.isAdmin()) return left(new UnauthorizedError())

    const power = await this.powerRepository.findById(powerId)

    if (!power) return left(new ResourceNotFoundError('Power'))

    await this.powerRepository.delete(power)

    return right(null)
  }
}
