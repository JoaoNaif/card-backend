import { left, right, type Either } from '../../../core/either'
import { TargetType } from '../../../entities/skill'
import { InvalidBattleActionError } from '../err/invalid-battle-action-error'
import {
  buildHpSnapshot,
  checkWinner,
  computeHpRatioWinner,
  computeTurnOrder,
  hasEligibleSkill,
  resolveAction,
  selectSkill,
  tickCooldowns,
  tickEffects,
} from './battle-engine'
import type { ActionLog, CombatantState, SkillLike, TurnLog } from './types'

export type ControlledBy = 'PLAYER' | 'AI'

export interface PveCombatant extends CombatantState {
  controlledBy: ControlledBy
}

export interface PveSessionState {
  combatants: PveCombatant[]
  skillsMap: Record<string, SkillLike>
  roundNumber: number
  maxTurns: number
  turnOrder: string[]
  actedIds: string[]
  currentRoundActions: ActionLog[]
  awaitingCharacterId: string | null
  status: 'ACTIVE' | 'FINISHED'
  winnerTeam: 1 | 2 | null
}

export interface PveAdvanceResult {
  state: PveSessionState
  completedRounds: TurnLog[]
}

export interface SubmitActionInput {
  characterId: string
  skillId: string
  targetId?: string
}

function getCombatant(
  state: PveSessionState,
  characterId: string
): PveCombatant | undefined {
  return state.combatants.find((c) => c.characterId === characterId)
}

function finishBattle(state: PveSessionState, winnerTeam: 1 | 2 | null): void {
  state.status = 'FINISHED'
  state.winnerTeam = winnerTeam
  state.awaitingCharacterId = null
}

function startNewRound(state: PveSessionState): void {
  state.roundNumber += 1
  state.turnOrder = computeTurnOrder(state.combatants).map((c) => c.characterId)
  state.actedIds = []
  state.currentRoundActions = []
}

/**
 * Advances the simulation from wherever it's currently paused: resolves AI actions and
 * auto-skips characters with no eligible skill, stopping either when a player-controlled
 * character with an eligible skill needs input, or when the battle ends.
 *
 * Turn order is recomputed from scratch at the start of every round (not carried over from
 * the previous one) — SPD-affecting buffs/debuffs applied mid-battle can reorder who acts
 * first in the next round.
 */
function advanceUntilBlocked(state: PveSessionState): PveAdvanceResult {
  const completedRounds: TurnLog[] = []

  while (state.status === 'ACTIVE') {
    const nextId = state.turnOrder.find((id) => {
      if (state.actedIds.includes(id)) return false
      const c = getCombatant(state, id)
      return c !== undefined && c.isAlive
    })

    if (nextId === undefined) {
      completedRounds.push({
        turn: state.roundNumber,
        actions: state.currentRoundActions,
        hpSnapshot: buildHpSnapshot(state.combatants),
      })

      const result = checkWinner(state.combatants)
      if (result !== 'ongoing') {
        finishBattle(state, result)
        break
      }

      if (state.roundNumber >= state.maxTurns) {
        finishBattle(state, computeHpRatioWinner(state.combatants))
        break
      }

      startNewRound(state)
      continue
    }

    const actor = getCombatant(state, nextId)!

    tickCooldowns(actor)
    tickEffects(actor)

    if (!hasEligibleSkill(actor)) {
      state.currentRoundActions.push({
        actorId: actor.characterId,
        skillId: null,
        targetIds: [],
      })
      state.actedIds.push(nextId)
      continue
    }

    if (actor.controlledBy === 'AI') {
      const skillId = selectSkill(actor, state.skillsMap)!
      const skill = state.skillsMap[skillId]!
      const actionLog = resolveAction(actor, skillId, skill, state.combatants)
      state.currentRoundActions.push(actionLog)
      state.actedIds.push(nextId)

      const mid = checkWinner(state.combatants)
      if (mid !== 'ongoing') {
        completedRounds.push({
          turn: state.roundNumber,
          actions: state.currentRoundActions,
          hpSnapshot: buildHpSnapshot(state.combatants),
        })
        finishBattle(state, mid)
        break
      }
      continue
    }

    // player-controlled, has an eligible skill -> pause here and wait for input
    state.awaitingCharacterId = nextId
    break
  }

  return { state, completedRounds }
}

export function createPveSession(
  combatants: PveCombatant[],
  skillsMap: Record<string, SkillLike>,
  maxTurns: number
): PveAdvanceResult {
  const state: PveSessionState = {
    combatants,
    skillsMap,
    roundNumber: 1,
    maxTurns,
    turnOrder: computeTurnOrder(combatants).map((c) => c.characterId),
    actedIds: [],
    currentRoundActions: [],
    awaitingCharacterId: null,
    status: 'ACTIVE',
    winnerTeam: null,
  }

  return advanceUntilBlocked(state)
}

export function submitPlayerAction(
  state: PveSessionState,
  input: SubmitActionInput
): Either<InvalidBattleActionError, PveAdvanceResult> {
  if (state.status !== 'ACTIVE') {
    return left(new InvalidBattleActionError('This battle has already ended.'))
  }

  if (state.awaitingCharacterId !== input.characterId) {
    return left(new InvalidBattleActionError("It is not this character's turn."))
  }

  const actor = getCombatant(state, input.characterId)
  if (!actor || actor.controlledBy !== 'PLAYER') {
    return left(
      new InvalidBattleActionError('This character is not controlled by the player.')
    )
  }

  if (!actor.skillIds.includes(input.skillId)) {
    return left(new InvalidBattleActionError('This character does not have that skill.'))
  }

  if ((actor.skillCooldowns[input.skillId] ?? 0) > 0) {
    return left(new InvalidBattleActionError('This skill is on cooldown.'))
  }

  const skill = state.skillsMap[input.skillId]
  if (!skill) {
    return left(new InvalidBattleActionError('Skill not found.'))
  }

  const needsExplicitTarget =
    skill.targetType === TargetType.SINGLE_ENEMY ||
    skill.targetType === TargetType.SINGLE_ALLY

  let explicitTargets: CombatantState[] | undefined
  if (needsExplicitTarget) {
    if (!input.targetId) {
      return left(new InvalidBattleActionError('This skill requires a target.'))
    }
    const target = getCombatant(state, input.targetId)
    if (!target || !target.isAlive) {
      return left(
        new InvalidBattleActionError('Invalid target: not found or already defeated.')
      )
    }
    const isEnemyTarget = target.teamNumber !== actor.teamNumber
    const isAllyTarget = target.teamNumber === actor.teamNumber
    if (skill.targetType === TargetType.SINGLE_ENEMY && !isEnemyTarget) {
      return left(new InvalidBattleActionError('This skill can only target an enemy.'))
    }
    if (skill.targetType === TargetType.SINGLE_ALLY && !isAllyTarget) {
      return left(new InvalidBattleActionError('This skill can only target an ally.'))
    }
    explicitTargets = [target]
  }

  const actionLog = resolveAction(
    actor,
    input.skillId,
    skill,
    state.combatants,
    explicitTargets
  )
  state.currentRoundActions.push(actionLog)
  state.actedIds.push(input.characterId)
  state.awaitingCharacterId = null

  const mid = checkWinner(state.combatants)
  if (mid !== 'ongoing') {
    const completedRounds: TurnLog[] = [
      {
        turn: state.roundNumber,
        actions: state.currentRoundActions,
        hpSnapshot: buildHpSnapshot(state.combatants),
      },
    ]
    finishBattle(state, mid)
    return right({ state, completedRounds })
  }

  return right(advanceUntilBlocked(state))
}
