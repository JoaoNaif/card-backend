import { right, type Either } from '../../core/either'
import type { IBattleFieldRepository } from '../../repositories/interface/battle-field-repository'
import type { DtoBattleFieldRaw } from './dtos/dto-battle-field-raw'

interface FetchBattleFieldUseCaseRequest {
  search: string
  page: number
  limit: number
}

type FetchBattleFieldUseCaseResponse = Either<
  null,
  {
    battleFields: DtoBattleFieldRaw[]
  }
>

export class FetchBattleFieldUseCase {
  constructor(private battleRepository: IBattleFieldRepository) {}

  async execute({
    search,
    page,
    limit,
  }: FetchBattleFieldUseCaseRequest): Promise<FetchBattleFieldUseCaseResponse> {
    const battleFields = await this.battleRepository.findAll(
      search,
      page,
      limit
    )

    return right({
      battleFields: battleFields.map((battleField) => ({
        id: battleField.id.toString(),
        name: battleField.name,
        description: battleField.description,
        createdAt: battleField.createdAt,
        modifiers: battleField.modifiers.map((mod) => ({
          id: mod.id,
          traitId: mod.traitId,
          traitName: mod.traitName,
          stat: mod.stat,
          bonusType: mod.bonusType,
          bonusValue: mod.bonusValue,
        })),
      })),
    })
  }
}
