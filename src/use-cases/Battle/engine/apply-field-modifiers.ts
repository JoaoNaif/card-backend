import type { BattleFieldModifier } from '../../../entities/battle-field'

export interface FieldAdjustableStats {
  hp: number
  atk: number
  def: number
  spd: number
}

const STAT_KEY: Record<string, keyof FieldAdjustableStats> = {
  HP: 'hp',
  ATK: 'atk',
  DEF: 'def',
  SPD: 'spd',
}

export function applyFieldModifiers(
  stats: FieldAdjustableStats,
  modifiers: BattleFieldModifier[]
): FieldAdjustableStats {
  const percent: FieldAdjustableStats = { hp: 0, atk: 0, def: 0, spd: 0 }
  const flat: FieldAdjustableStats = { hp: 0, atk: 0, def: 0, spd: 0 }

  for (const modifier of modifiers) {
    const key = STAT_KEY[modifier.stat]
    if (!key) continue
    if (modifier.bonusType === 'PERCENT') {
      percent[key] += modifier.bonusValue
    } else {
      flat[key] += modifier.bonusValue
    }
  }

  const result = {} as FieldAdjustableStats
  for (const key of Object.keys(stats) as (keyof FieldAdjustableStats)[]) {
    const withPercent = stats[key] * (1 + percent[key] / 100)
    result[key] = Math.max(0, Math.floor(withPercent + flat[key]))
  }

  return result
}
