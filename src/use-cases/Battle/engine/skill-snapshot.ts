import type { Skill } from '../../../entities/skill'
import type { SkillLike } from './types'

/**
 * Converts a `Skill` entity into a plain, JSON-round-trip-safe object. Entity getters live on
 * the prototype, not as own properties, so `JSON.stringify(skillEntity)` would serialize its
 * internal `props`/`_id` instead of a flat `{ damageMultiplier, ... }` shape — this snapshot is
 * what actually gets stored in `Battle.sessionState` between PvE requests.
 */
export function toSkillSnapshot(skill: Skill): SkillLike {
  return {
    name: skill.name,
    damageMultiplier: skill.damageMultiplier,
    healMultiplier: skill.healMultiplier,
    targetType: skill.targetType,
    debuffStat: skill.debuffStat,
    debuffValue: skill.debuffValue,
    debuffDuration: skill.debuffDuration,
    cooldownTurns: skill.cooldownTurns,
    targetEffectStat: skill.targetEffectStat,
    targetEffectValue: skill.targetEffectValue,
    targetEffectDuration: skill.targetEffectDuration,
  }
}
