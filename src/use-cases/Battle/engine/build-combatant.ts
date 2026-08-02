import type { BattleField } from '../../../entities/battle-field'
import type { Character } from '../../../entities/character'
import type { Skill } from '../../../entities/skill'
import { applyFieldModifiers } from './apply-field-modifiers'
import type { CombatantState } from './types'

export interface CombatantMemberInput {
  characterId: string
  positionRow: number
  positionCol: number
}

export function buildCombatantState(
  character: Character,
  member: CombatantMemberInput,
  skills: Skill[],
  battleField: BattleField,
  teamNumber: 1 | 2
): CombatantState {
  const traitIds = character.traits.map((trait) => trait.id)
  const fieldModifiers = battleField.modifiersFor(traitIds)
  const { hp, atk, def, spd } = applyFieldModifiers(
    {
      hp: character.effectiveHp,
      atk: character.effectiveAtk,
      def: character.effectiveDef,
      spd: character.effectiveSpd,
    },
    fieldModifiers
  )

  return {
    characterId: member.characterId,
    teamNumber,
    currentHp: hp,
    maxHp: hp,
    baseAtk: atk,
    baseDef: def,
    baseSpd: spd,
    hasDualPower: !!character.secondaryPowerId,
    skillIds: skills.map((s) => s.id.toString()),
    skillCooldowns: {},
    activeEffects: [],
    isAlive: true,
    positionRow: member.positionRow,
    positionCol: member.positionCol,
  }
}
