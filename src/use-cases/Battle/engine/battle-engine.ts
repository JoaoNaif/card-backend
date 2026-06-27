import type { Skill } from '../../../entities/skill'
import { StatType, TargetType } from '../../../entities/skill'
import type {
  ActionLog,
  ActiveEffect,
  BattleResult,
  CombatantState,
  TurnLog,
} from './types'

const DEFAULT_MAX_TURNS = 50

function effectiveStat(
  base: number,
  stat: StatType,
  effects: ActiveEffect[]
): number {
  const modifier = effects
    .filter((e) => e.stat === stat)
    .reduce((sum, e) => sum + e.value, 0)
  return Math.max(0, base + modifier)
}

function calcDamage(rawDmg: number, targetDef: number): number {
  return Math.floor((rawDmg * 100) / (100 + targetDef))
}

function selectTargets(
  actor: CombatantState,
  skill: Skill,
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

function tickCooldowns(actor: CombatantState): void {
  for (const skillId of Object.keys(actor.skillCooldowns)) {
    const current = actor.skillCooldowns[skillId]
    if (current !== undefined && current > 0) {
      actor.skillCooldowns[skillId] = current - 1
    }
  }
}

function tickEffects(combatant: CombatantState): void {
  combatant.activeEffects = combatant.activeEffects
    .map((e) => ({ ...e, turnsRemaining: e.turnsRemaining - 1 }))
    .filter((e) => e.turnsRemaining > 0)
}

function selectSkill(
  actor: CombatantState,
  skillsMap: Record<string, Skill>
): Skill | null {
  const eligible = actor.skillIds.filter(
    (id) => (actor.skillCooldowns[id] ?? 0) === 0
  )
  if (eligible.length === 0) return null
  const chosen = eligible[Math.floor(Math.random() * eligible.length)]
  if (chosen === undefined) return null
  return skillsMap[chosen] ?? null
}

function checkWinner(combatants: CombatantState[]): 1 | 2 | null | 'ongoing' {
  const team1Alive = combatants.some((c) => c.teamNumber === 1 && c.isAlive)
  const team2Alive = combatants.some((c) => c.teamNumber === 2 && c.isAlive)
  if (!team1Alive && !team2Alive) return null
  if (!team2Alive) return 1
  if (!team1Alive) return 2
  return 'ongoing'
}

export function runBattleEngine(
  combatants: CombatantState[],
  skillsMap: Record<string, Skill>,
  maxTurns = DEFAULT_MAX_TURNS
): BattleResult {
  const log: TurnLog[] = []

  for (let turn = 1; turn <= maxTurns; turn++) {
    const turnLog: TurnLog = { turn, actions: [] }

    const order = combatants
      .filter((c) => c.isAlive)
      .sort((a, b) => {
        const spdA = effectiveStat(a.baseSpd, StatType.SPD, a.activeEffects)
        const spdB = effectiveStat(b.baseSpd, StatType.SPD, b.activeEffects)
        return spdB - spdA
      })

    for (const actor of order) {
      if (!actor.isAlive) continue

      tickCooldowns(actor)
      tickEffects(actor)

      const skill = selectSkill(actor, skillsMap)
      if (!skill) {
        turnLog.actions.push({
          actorId: actor.characterId,
          skillId: null,
          targetIds: [],
        })
        continue
      }

      const targets = selectTargets(actor, skill, combatants)
      const actionLog: ActionLog = {
        actorId: actor.characterId,
        skillId: skill.id.toString(),
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
      actionLog.selfDebuff = {
        stat: skill.debuffStat,
        value: debuffValue,
        duration: skill.debuffDuration,
      }

      if (skill.cooldownTurns > 0) {
        actor.skillCooldowns[skill.id.toString()] = skill.cooldownTurns
      }

      turnLog.actions.push(actionLog)

      const mid = checkWinner(combatants)
      if (mid !== 'ongoing') {
        log.push(turnLog)
        return { winnerTeam: mid, totalTurns: turn, log }
      }
    }

    log.push(turnLog)

    const end = checkWinner(combatants)
    if (end !== 'ongoing') {
      return { winnerTeam: end, totalTurns: turn, log }
    }
  }

  // maxTurns reached — winner by surviving HP ratio
  const hpRatio = (team: 1 | 2) =>
    combatants
      .filter((c) => c.teamNumber === team)
      .reduce((sum, c) => sum + c.currentHp / c.maxHp, 0)

  const r1 = hpRatio(1)
  const r2 = hpRatio(2)
  const winnerTeam: 1 | 2 | null = r1 > r2 ? 1 : r2 > r1 ? 2 : null

  return { winnerTeam, totalTurns: maxTurns, log }
}
