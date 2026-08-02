import type { BattleFieldModifier } from '../../../entities/battle-field'
import { StatType, TargetType } from '../../../entities/skill'
import { effectiveStat } from './battle-engine'
import type { PveCombatant, PveSessionState } from './pve-engine'
import type { ActionLog, SkillLike, TurnLog } from './types'

export interface SkillCostDto {
  stat: StatType
  value: number
  duration: number
}

export interface SkillTargetEffectDto {
  stat: StatType
  value: number
  duration: number
}

export interface AvailableSkillDto {
  skillId: string
  name: string
  targetType: TargetType
  damageMultiplier: number
  healMultiplier: number
  /** Pre-mitigation power at this actor's current stats — floor(effectiveAtk * multiplier). */
  estimatedDamage: number | null
  estimatedHeal: number | null
  cooldownTurns: number
  /** Self-debuff paid for using the skill (already scaled ×1.25 if the actor has dual power). */
  cost: SkillCostDto
  appliesEffectToTarget: SkillTargetEffectDto | null
}

export interface ActiveEffectDto {
  stat: StatType
  value: number
  turnsRemaining: number
}

export interface PublicCombatantDto {
  characterId: string
  teamNumber: 1 | 2
  currentHp: number
  maxHp: number
  /** Effective stats — base plus whatever active buffs/debuffs are currently applied. */
  atk: number
  def: number
  spd: number
  isAlive: boolean
  controlledBy: 'PLAYER' | 'AI'
  activeEffects: ActiveEffectDto[]
}

export interface PveBattleFieldDto {
  id: string
  name: string
  description: string
  /** What this field affects: which stat, for characters with which trait, and by how much. */
  modifiers: BattleFieldModifier[]
}

export interface PveStateDto {
  status: 'ACTIVE' | 'FINISHED'
  roundNumber: number
  winnerTeam: 1 | 2 | null
  awaitingCharacterId: string | null
  availableSkills: AvailableSkillDto[]
  combatants: PublicCombatantDto[]
  battleField: PveBattleFieldDto
}

/** Everything resolved since the caller's last request: full completed rounds + the in-progress one, if any. */
export function flattenActions(
  completedRounds: TurnLog[],
  state: PveSessionState
): ActionLog[] {
  return [
    ...completedRounds.flatMap((round) => round.actions),
    ...(state.status === 'ACTIVE' ? state.currentRoundActions : []),
  ]
}

/** Full skillId -> name map for the battle, used to label actions in the response. */
export function buildSkillNames(state: PveSessionState): Record<string, string> {
  const names: Record<string, string> = {}
  for (const [id, skill] of Object.entries(state.skillsMap)) {
    names[id] = skill.name
  }
  return names
}

function buildAvailableSkillDto(
  skillId: string,
  skill: SkillLike,
  actor: PveCombatant
): AvailableSkillDto {
  const actorAtk = effectiveStat(actor.baseAtk, StatType.ATK, actor.activeEffects)
  const debuffMult = actor.hasDualPower ? 1.25 : 1

  return {
    skillId,
    name: skill.name,
    targetType: skill.targetType,
    damageMultiplier: skill.damageMultiplier,
    healMultiplier: skill.healMultiplier,
    estimatedDamage:
      skill.damageMultiplier > 0 ? Math.floor(actorAtk * skill.damageMultiplier) : null,
    estimatedHeal:
      skill.healMultiplier > 0 ? Math.floor(actorAtk * skill.healMultiplier) : null,
    cooldownTurns: skill.cooldownTurns,
    cost: {
      stat: skill.debuffStat,
      value: Math.round(skill.debuffValue * debuffMult),
      duration: skill.debuffDuration,
    },
    appliesEffectToTarget:
      skill.targetEffectStat && skill.targetEffectValue != null && skill.targetEffectDuration != null
        ? {
            stat: skill.targetEffectStat,
            value: skill.targetEffectValue,
            duration: skill.targetEffectDuration,
          }
        : null,
  }
}

export function buildStateDto(
  state: PveSessionState,
  battleField: PveBattleFieldDto
): PveStateDto {
  const awaiting = state.awaitingCharacterId
    ? state.combatants.find((c) => c.characterId === state.awaitingCharacterId)
    : undefined

  const availableSkills: AvailableSkillDto[] = awaiting
    ? awaiting.skillIds
        .filter((id) => (awaiting.skillCooldowns[id] ?? 0) === 0)
        .map((id) => buildAvailableSkillDto(id, state.skillsMap[id]!, awaiting))
    : []

  return {
    status: state.status,
    roundNumber: state.roundNumber,
    winnerTeam: state.winnerTeam,
    awaitingCharacterId: state.awaitingCharacterId,
    availableSkills,
    combatants: state.combatants.map((c) => ({
      characterId: c.characterId,
      teamNumber: c.teamNumber,
      currentHp: c.currentHp,
      maxHp: c.maxHp,
      atk: effectiveStat(c.baseAtk, StatType.ATK, c.activeEffects),
      def: effectiveStat(c.baseDef, StatType.DEF, c.activeEffects),
      spd: effectiveStat(c.baseSpd, StatType.SPD, c.activeEffects),
      isAlive: c.isAlive,
      controlledBy: c.controlledBy,
      activeEffects: c.activeEffects.map((e) => ({
        stat: e.stat,
        value: e.value,
        turnsRemaining: e.turnsRemaining,
      })),
    })),
    battleField,
  }
}
