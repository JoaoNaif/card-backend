import { faker } from '@faker-js/faker'
import type { UniqueEntityId } from '../../../core/entities/unique-entity-id'
import { Battle, BattleMode, BattleStatus, type BattleProps } from '../../../entities/battle'

export function makeBattle(
  override: Partial<BattleProps> = {},
  id?: UniqueEntityId
) {
  return Battle.create(
    {
      mode: BattleMode.AUTO,
      status: BattleStatus.COMPLETED,
      battleFieldId: faker.string.uuid(),
      totalTurns: 0,
      log: [],
      ...override,
    },
    id
  )
}
