import { describe, expect, it } from 'vitest'
import type { BattleFieldModifier } from '../../../entities/battle-field'
import { applyFieldModifiers } from './apply-field-modifiers'

function makeModifier(
  override: Partial<BattleFieldModifier> = {}
): BattleFieldModifier {
  return {
    id: 'mod-1',
    traitId: 'trait-1',
    traitName: 'Trait',
    stat: 'ATK',
    bonusType: 'PERCENT',
    bonusValue: 10,
    ...override,
  }
}

describe('applyFieldModifiers', () => {
  const baseStats = { hp: 100, atk: 10, def: 10, spd: 10 }

  it('returns the same stats when there are no modifiers', () => {
    expect(applyFieldModifiers(baseStats, [])).toEqual(baseStats)
  })

  it('applies a PERCENT bonus to the matching stat', () => {
    const result = applyFieldModifiers(baseStats, [
      makeModifier({ stat: 'ATK', bonusType: 'PERCENT', bonusValue: 50 }),
    ])

    expect(result.atk).toBe(15)
    expect(result).toMatchObject({ hp: 100, def: 10, spd: 10 })
  })

  it('applies a FLAT bonus to the matching stat', () => {
    const result = applyFieldModifiers(baseStats, [
      makeModifier({ stat: 'DEF', bonusType: 'FLAT', bonusValue: 7 }),
    ])

    expect(result.def).toBe(17)
  })

  it('stacks multiple modifiers on the same stat', () => {
    const result = applyFieldModifiers(baseStats, [
      makeModifier({ stat: 'SPD', bonusType: 'PERCENT', bonusValue: 20 }),
      makeModifier({ stat: 'SPD', bonusType: 'PERCENT', bonusValue: 30 }),
    ])

    // percentages sum before applying: 10 * (1 + 0.5) = 15
    expect(result.spd).toBe(15)
  })

  it('applies a PERCENT debuff (negative bonusValue)', () => {
    const result = applyFieldModifiers(baseStats, [
      makeModifier({ stat: 'HP', bonusType: 'PERCENT', bonusValue: -20 }),
    ])

    expect(result.hp).toBe(80)
  })

  it('never returns a negative stat', () => {
    const result = applyFieldModifiers(baseStats, [
      makeModifier({ stat: 'ATK', bonusType: 'FLAT', bonusValue: -100 }),
    ])

    expect(result.atk).toBe(0)
  })
})
