import { create } from 'node:domain'
import { UniqueEntityId } from '../../../core/entities/unique-entity-id'
import { BattleField } from '../../../entities/battle-field'
import type {
  BattleField as BattleFieldPrisma,
  BattleFieldModifier as BattleFieldModifierPrisma,
  Trait as TraitPrisma,
} from '../../../generated/prisma'

type BattleFieldWithModifiers = BattleFieldPrisma & {
  modifiers: (BattleFieldModifierPrisma & { trait: TraitPrisma })[]
}

export class PrismaBattleFieldMapper {
  static toDomain(raw: BattleFieldWithModifiers): BattleField {
    return BattleField.create(
      {
        name: raw.name,
        description: raw.description,
        modifiers: raw.modifiers.map((m) => ({
          id: m.id,
          traitId: m.traitId,
          traitName: m.trait.name,
          stat: m.stat,
          bonusType: m.bonusType,
          bonusValue: m.bonusValue,
        })),
        createdAt: raw.createdAt,
      },
      new UniqueEntityId(raw.id)
    )
  }

  static toPrisma(battleField: BattleField) {
    return {
      id: battleField.id.toString(),
      name: battleField.name,
      description: battleField.description,
      createdAt: battleField.createdAt,
    }
  }

  static toPrismaUpdate(battleField: BattleField) {
    return {
      name: battleField.name,
      description: battleField.description,
      createdAt: battleField.createdAt,
    }
  }
}
