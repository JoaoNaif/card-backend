import { AiDifficulty, AiPersonality } from '../../../entities/machine'
import { TargetType } from '../../../entities/skill'
import { resolveAction, selectTargets } from './battle-engine'
import type { CombatantState, SkillLike } from './types'

export { AiDifficulty, AiPersonality }

export interface AiDecision {
  skillId: string
  targets: CombatantState[]
}

interface PersonalityWeights {
  /** Weight on keeping own team's HP/board presence high. */
  selfPreservation: number
  /** Weight on lowering the enemy team's HP. */
  aggression: number
  /** Weight on reducing the number of enemies still standing. */
  killPriority: number
}

const PERSONALITY_WEIGHTS: Record<AiPersonality, PersonalityWeights> = {
  [AiPersonality.EQUILIBRADO]: { selfPreservation: 1, aggression: 1, killPriority: 1 },
  // moderado: contido — prioriza sobreviver e só então ataca
  [AiPersonality.MODERADO]: { selfPreservation: 1.6, aggression: 0.8, killPriority: 0.9 },
  // ousado: arrisca o próprio HP em troca de dano e de fechar abates
  [AiPersonality.OUSADO]: { selfPreservation: 0.5, aggression: 1.5, killPriority: 1.4 },
}

/** Chance of an AVANCADO machine ignoring its best-evaluated action and playing a random eligible skill instead — keeps it beatable and unpredictable. ESPECIALISTA never does this. */
const AVANCADO_NOISE = 0.15

function teamHpRatio(combatants: CombatantState[], team: 1 | 2): number {
  const members = combatants.filter((c) => c.teamNumber === team)
  if (members.length === 0) return 0
  return (
    members.reduce((sum, c) => sum + (c.isAlive ? c.currentHp / c.maxHp : 0), 0) /
    members.length
  )
}

function aliveCount(combatants: CombatantState[], team: 1 | 2): number {
  return combatants.filter((c) => c.teamNumber === team && c.isAlive).length
}

const CRITICAL_HP_RATIO = 0.3

/** Counts alive members of `team` below the critical-HP threshold — used to penalize trades that leave someone one hit from death, which a plain HP-average can miss. */
function criticalCount(combatants: CombatantState[], team: 1 | 2): number {
  return combatants.filter(
    (c) => c.teamNumber === team && c.isAlive && c.currentHp / c.maxHp < CRITICAL_HP_RATIO
  ).length
}

/** Scores a (hypothetical) battle state from `forTeam`'s perspective — higher is better for that team. */
export function evaluateState(
  combatants: CombatantState[],
  forTeam: 1 | 2,
  weights: PersonalityWeights
): number {
  const enemyTeam = forTeam === 1 ? 2 : 1
  const ownHp = teamHpRatio(combatants, forTeam)
  const enemyHp = teamHpRatio(combatants, enemyTeam)
  const enemyDefeated =
    combatants.filter((c) => c.teamNumber === enemyTeam).length -
    aliveCount(combatants, enemyTeam)

  return (
    ownHp * 100 * weights.selfPreservation +
    (1 - enemyHp) * 100 * weights.aggression +
    aliveCount(combatants, forTeam) * 25 * weights.selfPreservation +
    enemyDefeated * 40 * weights.killPriority -
    criticalCount(combatants, forTeam) * 60 * weights.selfPreservation
  )
}

function cloneCombatants(combatants: CombatantState[]): CombatantState[] {
  return combatants.map((c) => ({
    ...c,
    skillCooldowns: { ...c.skillCooldowns },
    activeEffects: c.activeEffects.map((e) => ({ ...e })),
  }))
}

/**
 * Candidate target sets to evaluate for a skill. When `branch` is false (cheaper, used by
 * INTERMEDIARIO), only the default heuristic target (lowest-HP) is considered. When true (used
 * by AVANCADO/ESPECIALISTA), every alive single-target candidate is evaluated on its own —
 * this is what lets the AI notice "this hit would finish off the healer" instead of always
 * defaulting to whoever has the least HP right now.
 */
function candidateTargetSets(
  actor: CombatantState,
  skill: SkillLike,
  combatants: CombatantState[],
  branch: boolean
): CombatantState[][] {
  if (branch && skill.targetType === TargetType.SINGLE_ENEMY) {
    const enemies = combatants.filter((c) => c.isAlive && c.teamNumber !== actor.teamNumber)
    return enemies.length > 0 ? enemies.map((e) => [e]) : [[]]
  }
  if (branch && skill.targetType === TargetType.SINGLE_ALLY) {
    const allies = combatants.filter((c) => c.isAlive && c.teamNumber === actor.teamNumber)
    return (allies.length > 0 ? allies : [actor]).map((a) => [a])
  }
  return [selectTargets(actor, skill, combatants)]
}

/**
 * Evaluates every eligible skill (and, if `branch`, every valid target for single-target
 * skills) by simulating it on a cloned state and scoring the result — picks whichever action
 * leaves `actor`'s team best off, weighted by personality.
 */
function selectBestAction(
  actor: CombatantState,
  eligibleSkillIds: string[],
  skillsMap: Record<string, SkillLike>,
  combatants: CombatantState[],
  personality: AiPersonality,
  branch: boolean
): AiDecision | null {
  const weights = PERSONALITY_WEIGHTS[personality]
  let best: { skillId: string; targetIds: string[]; score: number } | null = null

  for (const skillId of eligibleSkillIds) {
    const skill = skillsMap[skillId]!
    for (const targetSet of candidateTargetSets(actor, skill, combatants, branch)) {
      const clone = cloneCombatants(combatants)
      const clonedActor = clone.find((c) => c.characterId === actor.characterId)!
      const clonedTargets = targetSet.map(
        (t) => clone.find((c) => c.characterId === t.characterId)!
      )

      resolveAction(clonedActor, skillId, skill, clone, clonedTargets)
      const score = evaluateState(clone, actor.teamNumber, weights)

      if (!best || score > best.score) {
        best = { skillId, targetIds: clonedTargets.map((t) => t.characterId), score }
      }
    }
  }

  if (!best) return null
  const targets = best.targetIds
    .map((id) => combatants.find((c) => c.characterId === id))
    .filter((c): c is CombatantState => c !== undefined)
  return { skillId: best.skillId, targets }
}

/**
 * Chooses the AI's action for one turn. Difficulty controls how much foresight is applied:
 * - INICIANTE: uniformly random eligible skill, default target (original behavior).
 * - INTERMEDIARIO: simulates each eligible skill against its default target and picks the
 *   best-scored outcome.
 * - AVANCADO / ESPECIALISTA: also branches over every valid target for single-target skills,
 *   so it can pick who to hit, not just what to cast. AVANCADO keeps a small chance of playing
 *   a random skill instead, so it stays beatable; ESPECIALISTA always plays its best option.
 */
export function decideAiAction(
  actor: CombatantState,
  skillsMap: Record<string, SkillLike>,
  combatants: CombatantState[],
  difficulty: AiDifficulty = AiDifficulty.INICIANTE,
  personality: AiPersonality = AiPersonality.EQUILIBRADO
): AiDecision | null {
  const eligible = actor.skillIds.filter((id) => (actor.skillCooldowns[id] ?? 0) === 0)
  if (eligible.length === 0) return null

  const pickRandom = (): AiDecision => {
    const skillId = eligible[Math.floor(Math.random() * eligible.length)]!
    const skill = skillsMap[skillId]!
    return { skillId, targets: selectTargets(actor, skill, combatants) }
  }

  if (difficulty === AiDifficulty.INICIANTE) return pickRandom()

  if (difficulty === AiDifficulty.INTERMEDIARIO) {
    return (
      selectBestAction(actor, eligible, skillsMap, combatants, personality, false) ??
      pickRandom()
    )
  }

  if (difficulty === AiDifficulty.AVANCADO && Math.random() < AVANCADO_NOISE) {
    return pickRandom()
  }

  return (
    selectBestAction(actor, eligible, skillsMap, combatants, personality, true) ?? pickRandom()
  )
}
