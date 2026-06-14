import { left, right, type Either } from '../../core/either'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'
import { ResourceAlreadyExistError } from '../../core/error/err/resource-already-exist-error'
import { UnauthorizedError } from '../../core/error/err/unauthorized-error'
import { BattleField, type BonusType, type StatType } from '../../entities/battle-field'
import { UniqueEntityId } from '../../core/entities/unique-entity-id'
import type { IBattleFieldRepository } from '../../repositories/interface/battle-field-repository'
import type { ITraitRepository } from '../../repositories/interface/trait-repository'
import type { IUserRepository } from '../../repositories/interface/user-repository'
import type { DtoBattleFieldRaw } from './dtos/dto-battle-field-raw'

interface ModifierInput {
  traitId: string
  stat: StatType
  bonusType: BonusType
  bonusValue: number
}

interface CreateBattleFieldUseCaseRequest {
  userId: string
  name: string
  description: string
  modifiers: ModifierInput[]
}

type CreateBattleFieldUseCaseResponse = Either<
  ResourceNotFoundError | ResourceAlreadyExistError | UnauthorizedError,
  { battleField: DtoBattleFieldRaw }
>

export class CreateBattleFieldUseCase {
  constructor(
    private battleFieldRepository: IBattleFieldRepository,
    private userRepository: IUserRepository,
    private traitRepository: ITraitRepository
  ) {}

  async execute({
    userId,
    name,
    description,
    modifiers,
  }: CreateBattleFieldUseCaseRequest): Promise<CreateBattleFieldUseCaseResponse> {
    const user = await this.userRepository.findById(userId)

    if (!user) return left(new ResourceNotFoundError('User'))
    if (!user.isAdmin()) return left(new UnauthorizedError())

    const existing = await this.battleFieldRepository.findByName(name)
    if (existing) return left(new ResourceAlreadyExistError('BattleField'))

    const resolvedModifiers = []

    for (const mod of modifiers) {
      const trait = await this.traitRepository.findById(mod.traitId)
      if (!trait) return left(new ResourceNotFoundError('Trait'))
      resolvedModifiers.push({
        id: new UniqueEntityId().toString(),
        traitId: mod.traitId,
        traitName: trait.name,
        stat: mod.stat,
        bonusType: mod.bonusType,
        bonusValue: mod.bonusValue,
      })
    }

    const battleField = BattleField.create({ name, description, modifiers: resolvedModifiers })

    await this.battleFieldRepository.create(battleField)

    return right({
      battleField: {
        id: battleField.id.toString(),
        name: battleField.name,
        description: battleField.description,
        modifiers: battleField.modifiers,
        createdAt: battleField.createdAt,
      },
    })
  }
}
