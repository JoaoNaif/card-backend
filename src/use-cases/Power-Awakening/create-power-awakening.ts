import { left, right, type Either } from '../../core/either'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'
import { ResourceAlreadyExistError } from '../../core/error/err/resource-already-exist-error'
import { UnauthorizedError } from '../../core/error/err/unauthorized-error'
import { PowerAwakening } from '../../entities/power-awakening'
import type { IPowerAwakeningRepository } from '../../repositories/interface/power-awakening-repository'
import type { IPowerRepository } from '../../repositories/interface/power-repository'
import type { IUserRepository } from '../../repositories/interface/user-repository'
import type { DtoPowerAwakeningRaw } from './dtos/dto-power-awakening-raw'
import { PowerIsNotAwakeningError } from './err/power-is-not-awakening-error'
import { PowerWithoutAwakeningError } from './err/power-without-awakening-error'

interface PowerAwakeningUseCaseRequest {
  userId: string
  basePowerId: string
  awakenedPowerId: string
}

type PowerAwakeningUseCaseResponse = Either<
  | ResourceAlreadyExistError
  | ResourceNotFoundError
  | UnauthorizedError
  | PowerIsNotAwakeningError
  | PowerWithoutAwakeningError,
  {
    powerAwakening: DtoPowerAwakeningRaw
  }
>

export class PowerAwakeningUseCase {
  constructor(
    private powerAwakeningRepository: IPowerAwakeningRepository,
    private powerRepository: IPowerRepository,
    private userRepository: IUserRepository
  ) {}

  async execute({
    userId,
    basePowerId,
    awakenedPowerId,
  }: PowerAwakeningUseCaseRequest): Promise<PowerAwakeningUseCaseResponse> {
    const user = await this.userRepository.findById(userId)

    if (!user) return left(new ResourceNotFoundError('User'))
    if (!user.isAdmin()) return left(new UnauthorizedError())

    const basePower = await this.powerRepository.findById(basePowerId)

    if (!basePower) return left(new ResourceNotFoundError('Base Power'))
    if (!basePower.canAwaken) return left(new PowerWithoutAwakeningError())

    const awakePower = await this.powerRepository.findById(awakenedPowerId)

    if (!awakePower) return left(new ResourceNotFoundError('Awake Power'))
    if (!awakePower.isAwakened) return left(new PowerIsNotAwakeningError())

    const powerAwakeningAlreadyExists =
      await this.powerAwakeningRepository.findByBaseAndAwakened(
        basePowerId,
        awakenedPowerId
      )

    if (powerAwakeningAlreadyExists) {
      return left(
        new ResourceAlreadyExistError('Base Power and Awakened Power')
      )
    }

    const powerAwakening = PowerAwakening.create({
      basePowerId,
      awakenedPowerId,
    })

    await this.powerAwakeningRepository.create(powerAwakening)

    return right({
      powerAwakening: {
        id: powerAwakening.id.toString(),
        basePowerId: powerAwakening.basePowerId,
        awakenedPowerId: powerAwakening.awakenedPowerId,
      },
    })
  }
}
