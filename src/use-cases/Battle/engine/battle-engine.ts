import { StatType, TargetType } from '../../../entities/skill'
import type {
  ActionLog,
  ActiveEffect,
  BattleResult,
  CombatantState,
  SkillLike,
  TurnLog,
} from './types'

export const DEFAULT_MAX_TURNS = 50

export function effectiveStat(
  base: number,
  stat: StatType,
  effects: ActiveEffect[]
): number {
  const modifier = effects
    .filter((e) => e.stat === stat)
    .reduce((sum, e) => sum + e.value, 0)
  return Math.max(0, base + modifier)
}

export function calcDamage(rawDmg: number, targetDef: number): number {
  return Math.floor((rawDmg * 100) / (100 + targetDef))
}

export function selectTargets(
  actor: CombatantState,
  skill: SkillLike,
  combatants: CombatantState[]
): CombatantState[] {
  const enemies = combatants.filter(
    (c) => c.isAlive && c.teamNumber !== actor.teamNumber
  )
  const allies = combatants.filter(
    (c) => c.isAlive && c.teamNumber === actor.teamNumber
  )

  switch (skill.targetType) {
    case TargetType.SINGLE_ENEMY: {
      if (enemies.length === 0) return []
      return [
        enemies.reduce(
          (lowest, c) => (c.currentHp < lowest.currentHp ? c : lowest),
          enemies[0]!
        ),
      ]
    }
    case TargetType.AOE_ENEMIES:
      return enemies
    case TargetType.SINGLE_ALLY: {
      // includes self — targets ally (or self) with lowest HP
      if (allies.length === 0) return [actor]
      return [
        allies.reduce((lowest, c) =>
          c.currentHp < lowest.currentHp ? c : lowest
        ),
      ]
    }
    case TargetType.ALL_ALLIES:
      return allies.length > 0 ? allies : [actor]
    case TargetType.SELF:
      return [actor]
  }
}

export function tickCooldowns(actor: CombatantState): void {
  for (const skillId of Object.keys(actor.skillCooldowns)) {
    const current = actor.skillCooldowns[skillId]
    if (current !== undefined && current > 0) {
      actor.skillCooldowns[skillId] = current - 1
    }
  }
}

/**
 * ATK/DEF/SPD effects are read live via `effectiveStat` on every calculation, so they need no
 * special handling here — once removed from `activeEffects` they simply stop being counted. HP
 * is different: `currentHp` is a persistent pool, not recomputed from a base value, so an HP
 * effect has to be applied to it directly when pushed and reverted directly when it expires.
 */
function applyHpDelta(combatant: CombatantState, delta: number): void {
  combatant.currentHp = Math.max(0, Math.min(combatant.maxHp, combatant.currentHp + delta))
  if (combatant.currentHp === 0) combatant.isAlive = false
}

export function tickEffects(combatant: CombatantState): void {
  const decremented = combatant.activeEffects.map((e) => ({
    ...e,
    turnsRemaining: e.turnsRemaining - 1,
  }))
  const expired = decremented.filter((e) => e.turnsRemaining <= 0)
  combatant.activeEffects = decremented.filter((e) => e.turnsRemaining > 0)

  for (const effect of expired) {
    if (effect.stat === StatType.HP) {
      applyHpDelta(combatant, -effect.value)
    }
  }
}

export function hasEligibleSkill(actor: CombatantState): boolean {
  return actor.skillIds.some((id) => (actor.skillCooldowns[id] ?? 0) === 0)
}

/** Randomly picks an eligible (off-cooldown) skill id — used for AI-controlled combatants. */
export function selectSkill(
  actor: CombatantState,
  skillsMap: Record<string, SkillLike>
): string | null {
  const eligible = actor.skillIds.filter(
    (id) => (actor.skillCooldowns[id] ?? 0) === 0
  )
  if (eligible.length === 0) return null
  const chosen = eligible[Math.floor(Math.random() * eligible.length)]
  return chosen ?? null
}

export function buildHpSnapshot(combatants: CombatantState[]): Record<string, number> {
  const snapshot: Record<string, number> = {}
  for (const c of combatants) {
    snapshot[c.characterId] = c.currentHp
  }
  return snapshot
}

export function checkWinner(combatants: CombatantState[]): 1 | 2 | null | 'ongoing' {
  const team1Alive = combatants.some((c) => c.teamNumber === 1 && c.isAlive)
  const team2Alive = combatants.some((c) => c.teamNumber === 2 && c.isAlive)
  if (!team1Alive && !team2Alive) return null
  if (!team2Alive) return 1
  if (!team1Alive) return 2
  return 'ongoing'
}

export function computeHpRatioWinner(combatants: CombatantState[]): 1 | 2 | null {
  const hpRatio = (team: 1 | 2) =>
    combatants
      .filter((c) => c.teamNumber === team)
      .reduce((sum, c) => sum + c.currentHp / c.maxHp, 0)

  const r1 = hpRatio(1)
  const r2 = hpRatio(2)
  return r1 > r2 ? 1 : r2 > r1 ? 2 : null
}

/** Recomputes turn order by effective SPD — called fresh every round, since buffs/debuffs can change it mid-battle. */
export function computeTurnOrder(combatants: CombatantState[]): CombatantState[] {
  return combatants
    .filter((c) => c.isAlive)
    .sort((a, b) => {
      const spdA = effectiveStat(a.baseSpd, StatType.SPD, a.activeEffects)
      const spdB = effectiveStat(b.baseSpd, StatType.SPD, b.activeEffects)
      return spdB - spdA
    })
}

/**
 * Applies a skill's effects (damage/heal/target-effect/self-debuff/cooldown) for one actor.
 * If `explicitTargets` is omitted, targets are auto-selected via `selectTargets` (used by AI
 * and by player-chosen skills whose targetType doesn't require picking a specific target).
 */
export function resolveAction(
  actor: CombatantState,
  skillId: string,
  skill: SkillLike,
  combatants: CombatantState[],
  explicitTargets?: CombatantState[]
): ActionLog {
  const targets = explicitTargets ?? selectTargets(actor, skill, combatants)
  const actionLog: ActionLog = {
    actorId: actor.characterId,
    skillId,
    targetIds: targets.map((t) => t.characterId),
  }

  const actorAtk = effectiveStat(actor.baseAtk, StatType.ATK, actor.activeEffects)

  for (const target of targets) {
    const targetDef = effectiveStat(
      target.baseDef,
      StatType.DEF,
      target.activeEffects
    )

    if (skill.damageMultiplier > 0) {
      const raw = Math.floor(actorAtk * skill.damageMultiplier)
      const dmg = calcDamage(raw, targetDef)
      target.currentHp = Math.max(0, target.currentHp - dmg)
      if (target.currentHp === 0) target.isAlive = false
      actionLog.damage = (actionLog.damage ?? 0) + dmg
    }

    if (skill.healMultiplier > 0) {
      const heal = Math.floor(actorAtk * skill.healMultiplier)
      target.currentHp = Math.min(target.maxHp, target.currentHp + heal)
      actionLog.heal = (actionLog.heal ?? 0) + heal
    }

    if (
      skill.targetEffectStat &&
      skill.targetEffectValue != null &&
      skill.targetEffectDuration != null
    ) {
      target.activeEffects.push({
        stat: skill.targetEffectStat,
        value: skill.targetEffectValue,
        turnsRemaining: skill.targetEffectDuration,
      })
      if (skill.targetEffectStat === StatType.HP) {
        applyHpDelta(target, skill.targetEffectValue)
      }
      actionLog.effectApplied = {
        stat: skill.targetEffectStat,
        value: skill.targetEffectValue,
        duration: skill.targetEffectDuration,
      }
    }
  }

  // self-debuff: cost of using the skill (×1.25 for dual power)
  const debuffMult = actor.hasDualPower ? 1.25 : 1
  const debuffValue = -Math.round(skill.debuffValue * debuffMult)
  actor.activeEffects.push({
    stat: skill.debuffStat,
    value: debuffValue,
    turnsRemaining: skill.debuffDuration,
  })
  if (skill.debuffStat === StatType.HP) {
    applyHpDelta(actor, debuffValue)
  }
  actionLog.selfDebuff = {
    stat: skill.debuffStat,
    value: debuffValue,
    duration: skill.debuffDuration,
  }

  if (skill.cooldownTurns > 0) {
    actor.skillCooldowns[skillId] = skill.cooldownTurns
  }

  return actionLog
}

export function runBattleEngine(
  combatants: CombatantState[],
  skillsMap: Record<string, SkillLike>,
  maxTurns = DEFAULT_MAX_TURNS
): BattleResult {
  const log: TurnLog[] = []

  for (let turn = 1; turn <= maxTurns; turn++) {
    const turnLog: TurnLog = { turn, actions: [], hpSnapshot: {} }

    const order = computeTurnOrder(combatants)

    for (const actor of order) {
      if (!actor.isAlive) continue

      tickCooldowns(actor)
      tickEffects(actor)

      const skillId = selectSkill(actor, skillsMap)
      if (!skillId) {
        turnLog.actions.push({
          actorId: actor.characterId,
          skillId: null,
          targetIds: [],
        })
        continue
      }

      const skill = skillsMap[skillId]!
      const actionLog = resolveAction(actor, skillId, skill, combatants)
      turnLog.actions.push(actionLog)

      const mid = checkWinner(combatants)
      if (mid !== 'ongoing') {
        turnLog.hpSnapshot = buildHpSnapshot(combatants)
        log.push(turnLog)
        return { winnerTeam: mid, totalTurns: turn, log }
      }
    }

    turnLog.hpSnapshot = buildHpSnapshot(combatants)
    log.push(turnLog)

    const end = checkWinner(combatants)
    if (end !== 'ongoing') {
      return { winnerTeam: end, totalTurns: turn, log }
    }
  }

  // maxTurns reached — winner by surviving HP ratio
  return {
    winnerTeam: computeHpRatioWinner(combatants),
    totalTurns: maxTurns,
    log,
  }
}
