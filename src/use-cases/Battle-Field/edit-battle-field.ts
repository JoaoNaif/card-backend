import { left, right, type Either } from '../../core/either'
import { ResourceAlreadyExistError } from '../../core/error/err/resource-already-exist-error'
import type { IUserRepository } from '../../repositories/interface/user-repository'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'
import { UnauthorizedError } from '../../core/error/err/unauthorized-error'
import type { IBattleFieldRepository } from '../../repositories/interface/battle-field-repository'

interface EditBattleFieldUseCaseRequest {
  adminId: string
  battleFieldId: string
  name: string
  description: string
}

type EditBattleFieldUseCaseResponse = Either<
  ResourceAlreadyExistError | ResourceNotFoundError | UnauthorizedError,
  null
>
export class EditBattleFieldUseCase {
  constructor(
    private userRepository: IUserRepository,
    private battleFieldRepository: IBattleFieldRepository
  ) {}

  async execute({
    adminId,
    battleFieldId,
    name,
    description,
  }: EditBattleFieldUseCaseRequest): Promise<EditBattleFieldUseCaseResponse> {
    const user = await this.userRepository.findById(adminId)

    if (!user) return left(new ResourceNotFoundError('User'))

    if (!user.isAdmin()) return left(new UnauthorizedError())

    const battleField = await this.battleFieldRepository.findById(battleFieldId)

    if (!battleField) return left(new ResourceNotFoundError('Battle Field'))

    if (name) {
      const newName = await this.battleFieldRepository.findByName(name)

      if (newName) return left(new ResourceAlreadyExistError('Name'))

      battleField.name = name
    }

    battleField.description = description ?? battleField.description

    await this.battleFieldRepository.save(battleField)

    return right(null)
  }
}
