import { left, right, type Either } from '../../core/either'
import type { IUserRepository } from '../../repositories/interface/user-repository'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'
import { UnauthorizedError } from '../../core/error/err/unauthorized-error'
import type { IBattleFieldRepository } from '../../repositories/interface/battle-field-repository'

interface RemoveBattleFieldUseCaseRequest {
  battleFieldId: string
  adminId: string
}

type RemoveBattleFieldUseCaseResponse = Either<
  ResourceNotFoundError | UnauthorizedError,
  null
>
export class RemoveBattleFieldUseCase {
  constructor(
    private userRepository: IUserRepository,
    private battleFieldRepository: IBattleFieldRepository
  ) {}

  async execute({
    adminId,
    battleFieldId,
  }: RemoveBattleFieldUseCaseRequest): Promise<RemoveBattleFieldUseCaseResponse> {
    const user = await this.userRepository.findById(adminId)

    if (!user) return left(new ResourceNotFoundError('Email'))

    if (!user.isAdmin()) return left(new UnauthorizedError())

    const battleField = await this.battleFieldRepository.findById(battleFieldId)

    if (!battleField) return left(new ResourceNotFoundError('Battle Field'))

    await this.battleFieldRepository.delete(battleField)

    return right(null)
  }
}
