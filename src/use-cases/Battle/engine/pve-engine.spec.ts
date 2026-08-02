import { describe, expect, it } from 'vitest'
import { StatType, TargetType } from '../../../entities/skill'
import { InvalidBattleActionError } from '../err/invalid-battle-action-error'
import { createPveSession, submitPlayerAction, type PveCombatant } from './pve-engine'
import type { SkillLike } from './types'

function makeCombatant(overrides: Partial<PveCombatant>): PveCombatant {
  return {
    characterId: 'char',
    teamNumber: 1,
    currentHp: 100,
    maxHp: 100,
    baseAtk: 10,
    baseDef: 10,
    baseSpd: 10,
    hasDualPower: false,
    skillIds: [],
    skillCooldowns: {},
    activeEffects: [],
    isAlive: true,
    positionRow: 0,
    positionCol: 0,
    controlledBy: 'AI',
    ...overrides,
  }
}

const selfSkip: SkillLike = {
  name: 'Self Skip',
  damageMultiplier: 0,
  healMultiplier: 0,
  targetType: TargetType.SELF,
  debuffStat: StatType.HP,
  debuffValue: 0,
  debuffDuration: 1,
  cooldownTurns: 0,
  targetEffectStat: null,
  targetEffectValue: null,
  targetEffectDuration: null,
}

describe('pve-engine', () => {
  it('recomputes turn order every round — a mid-battle SPD buff can overtake a faster combatant', () => {
    const a = makeCombatant({
      characterId: 'a',
      teamNumber: 1,
      controlledBy: 'PLAYER',
      baseSpd: 120,
      skillIds: ['a-skip'],
    })
    const b = makeCombatant({
      characterId: 'b',
      teamNumber: 2,
      controlledBy: 'AI',
      baseSpd: 100,
      skillIds: ['b-buff'],
    })

    const skillsMap: Record<string, SkillLike> = {
      'a-skip': selfSkip,
      'b-buff': {
        ...selfSkip,
        targetType: TargetType.SELF,
        targetEffectStat: StatType.SPD,
        targetEffectValue: 50,
        targetEffectDuration: 10,
      },
    }

    const { state } = createPveSession([a, b], skillsMap, 10)
    // round 1: A (120) is faster than B (100) -> A goes first and is asked for input
    expect(state.roundNumber).toBe(1)
    expect(state.awaitingCharacterId).toBe('a')

    const result = submitPlayerAction(state, { characterId: 'a', skillId: 'a-skip' })
    expect(result.isRight()).toBe(true)
    if (!result.isRight()) return

    // round 1 finished (A skipped, B self-buffed +50 SPD -> effective 150), round 2 begins
    expect(result.value.completedRounds).toHaveLength(1)
    expect(result.value.state.roundNumber).toBe(2)
    // B is now faster (150 > 120) — turn order for round 2 flips
    expect(result.value.state.turnOrder).toEqual(['b', 'a'])
    expect(result.value.state.awaitingCharacterId).toBe('a')
  })

  it('auto-skips a player character with no eligible skill instead of waiting for input', () => {
    const a = makeCombatant({
      characterId: 'a',
      teamNumber: 1,
      controlledBy: 'PLAYER',
      baseSpd: 20,
      skillIds: ['a-cooldown'],
    })
    const b = makeCombatant({
      characterId: 'b',
      teamNumber: 2,
      controlledBy: 'AI',
      baseSpd: 10,
      skillIds: [], // no skills -> always auto-skips too
    })

    const skillsMap: Record<string, SkillLike> = {
      'a-cooldown': { ...selfSkip, cooldownTurns: 2 },
    }

    const { state } = createPveSession([a, b], skillsMap, 10)
    expect(state.awaitingCharacterId).toBe('a')

    const result = submitPlayerAction(state, { characterId: 'a', skillId: 'a-cooldown' })
    expect(result.isRight()).toBe(true)
    if (!result.isRight()) return

    // round 1: A uses the skill (cooldown -> 2), B auto-skips (no skills)
    // round 2: A's cooldown ticks to 1 -> still on cooldown -> auto-skips too, B auto-skips
    // round 3: A's cooldown ticks to 0 -> eligible again -> pauses for input
    expect(result.value.completedRounds).toHaveLength(2)

    const round2 = result.value.completedRounds[1]!
    const aActionRound2 = round2.actions.find((act) => act.actorId === 'a')
    expect(aActionRound2).toEqual({ actorId: 'a', skillId: null, targetIds: [] })

    expect(result.value.state.roundNumber).toBe(3)
    expect(result.value.state.awaitingCharacterId).toBe('a')
  })

  it('lets the player pick an explicit target, overriding the lowest-HP auto heuristic', () => {
    const attacker = makeCombatant({
      characterId: 'attacker',
      teamNumber: 1,
      controlledBy: 'PLAYER',
      baseSpd: 100,
      skillIds: ['attack'],
    })
    const enemyLowHp = makeCombatant({
      characterId: 'enemy-low',
      teamNumber: 2,
      controlledBy: 'AI',
      currentHp: 10,
      maxHp: 1000,
      skillIds: [],
    })
    const enemyHighHp = makeCombatant({
      characterId: 'enemy-high',
      teamNumber: 2,
      controlledBy: 'AI',
      currentHp: 1000,
      maxHp: 1000,
      baseDef: 0,
      skillIds: [],
    })

    const skillsMap: Record<string, SkillLike> = {
      attack: { ...selfSkip, targetType: TargetType.SINGLE_ENEMY, damageMultiplier: 1 },
    }

    const { state } = createPveSession(
      [attacker, enemyLowHp, enemyHighHp],
      skillsMap,
      10
    )

    const result = submitPlayerAction(state, {
      characterId: 'attacker',
      skillId: 'attack',
      targetId: 'enemy-high',
    })
    expect(result.isRight()).toBe(true)
    if (!result.isRight()) return

    const updatedHigh = result.value.state.combatants.find(
      (c) => c.characterId === 'enemy-high'
    )!
    const updatedLow = result.value.state.combatants.find(
      (c) => c.characterId === 'enemy-low'
    )!
    expect(updatedHigh.currentHp).toBeLessThan(1000)
    expect(updatedLow.currentHp).toBe(10) // untouched — heuristic would've picked this one
  })

  it('rejects a target that is not a legal enemy for a SINGLE_ENEMY skill', () => {
    const attacker = makeCombatant({
      characterId: 'attacker',
      teamNumber: 1,
      controlledBy: 'PLAYER',
      skillIds: ['attack'],
    })
    const ally = makeCombatant({ characterId: 'ally', teamNumber: 1, skillIds: [] })
    const enemy = makeCombatant({ characterId: 'enemy', teamNumber: 2, skillIds: [] })

    const skillsMap: Record<string, SkillLike> = {
      attack: { ...selfSkip, targetType: TargetType.SINGLE_ENEMY, damageMultiplier: 1 },
    }

    const { state } = createPveSession([attacker, ally, enemy], skillsMap, 10)

    const result = submitPlayerAction(state, {
      characterId: 'attacker',
      skillId: 'attack',
      targetId: 'ally',
    })
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(InvalidBattleActionError)
  })

  it('rejects an action submitted for a character whose turn it is not', () => {
    const a = makeCombatant({
      characterId: 'a',
      teamNumber: 1,
      controlledBy: 'PLAYER',
      baseSpd: 100,
      skillIds: ['a-skip'],
    })
    const b = makeCombatant({
      characterId: 'b',
      teamNumber: 2,
      controlledBy: 'PLAYER',
      baseSpd: 10,
      skillIds: ['a-skip'],
    })

    const { state } = createPveSession([a, b], { 'a-skip': selfSkip }, 10)
    expect(state.awaitingCharacterId).toBe('a')

    const result = submitPlayerAction(state, { characterId: 'b', skillId: 'a-skip' })
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(InvalidBattleActionError)
  })

  it('finishes the battle and reports the winner once one side is fully defeated', () => {
    const attacker = makeCombatant({
      characterId: 'attacker',
      teamNumber: 1,
      controlledBy: 'PLAYER',
      baseSpd: 100,
      baseAtk: 1000,
      skillIds: ['finisher'],
    })
    const victim = makeCombatant({
      characterId: 'victim',
      teamNumber: 2,
      controlledBy: 'AI',
      currentHp: 1,
      maxHp: 1,
      baseDef: 0,
      skillIds: [],
    })

    const skillsMap: Record<string, SkillLike> = {
      finisher: { ...selfSkip, targetType: TargetType.SINGLE_ENEMY, damageMultiplier: 10 },
    }

    const { state } = createPveSession([attacker, victim], skillsMap, 10)

    const result = submitPlayerAction(state, {
      characterId: 'attacker',
      skillId: 'finisher',
      targetId: 'victim',
    })
    expect(result.isRight()).toBe(true)
    if (!result.isRight()) return

    expect(result.value.state.status).toBe('FINISHED')
    expect(result.value.state.winnerTeam).toBe(1)
    expect(result.value.state.awaitingCharacterId).toBeNull()
  })

  it('applies an HP-stat self-debuff (cost) immediately, and reverts it once the effect expires', () => {
    const caster = makeCombatant({
      characterId: 'caster',
      teamNumber: 1,
      controlledBy: 'PLAYER',
      baseSpd: 100,
      currentHp: 100,
      maxHp: 100,
      skillIds: ['costly', 'noop'],
    })
    const filler = makeCombatant({
      characterId: 'filler',
      teamNumber: 2,
      controlledBy: 'AI',
      baseSpd: 10,
      skillIds: [], // always auto-skips, doesn't interfere
    })

    const skillsMap: Record<string, SkillLike> = {
      costly: { ...selfSkip, debuffValue: 20, debuffDuration: 2 },
      noop: { ...selfSkip, debuffValue: 0, debuffDuration: 1 },
    }

    const { state } = createPveSession([caster, filler], skillsMap, 10)

    // round 1: cost is paid immediately
    const r1 = submitPlayerAction(state, { characterId: 'caster', skillId: 'costly' })
    expect(r1.isRight()).toBe(true)
    if (!r1.isRight()) return
    expect(
      r1.value.state.combatants.find((c) => c.characterId === 'caster')!.currentHp
    ).toBe(80)

    // round 2: submitting again ticks the effect down (still 1 turn left) — HP stays reduced
    const r2 = submitPlayerAction(r1.value.state, { characterId: 'caster', skillId: 'noop' })
    expect(r2.isRight()).toBe(true)
    if (!r2.isRight()) return

    // by the time round 3 starts, tickEffects ran again on caster's turn, the effect's
    // duration (2 of caster's own turns) is up, and its HP cost is reverted
    expect(r2.value.state.roundNumber).toBe(3)
    expect(
      r2.value.state.combatants.find((c) => c.characterId === 'caster')!.currentHp
    ).toBe(100)
  })

  it('applies an HP-stat target effect immediately, and reverts it once it expires', () => {
    const attacker = makeCombatant({
      characterId: 'attacker',
      teamNumber: 1,
      controlledBy: 'PLAYER',
      baseSpd: 100,
      skillIds: ['poison', 'wait'],
    })
    const victim = makeCombatant({
      characterId: 'victim',
      teamNumber: 2,
      controlledBy: 'AI',
      currentHp: 100,
      maxHp: 100,
      skillIds: [], // no skills -> always auto-skips, ticks down its own effects each round
    })

    const skillsMap: Record<string, SkillLike> = {
      poison: {
        ...selfSkip,
        targetType: TargetType.SINGLE_ENEMY,
        debuffValue: 0,
        targetEffectStat: StatType.HP,
        targetEffectValue: -15,
        targetEffectDuration: 3, // 3 of the victim's own turns
      },
      wait: selfSkip,
    }

    const { state } = createPveSession([attacker, victim], skillsMap, 10)

    const r1 = submitPlayerAction(state, {
      characterId: 'attacker',
      skillId: 'poison',
      targetId: 'victim',
    })
    expect(r1.isRight()).toBe(true)
    if (!r1.isRight()) return
    // applied immediately, and still active one round later (duration not yet elapsed)
    expect(
      r1.value.state.combatants.find((c) => c.characterId === 'victim')!.currentHp
    ).toBe(85)

    const r2 = submitPlayerAction(r1.value.state, {
      characterId: 'attacker',
      skillId: 'wait',
    })
    expect(r2.isRight()).toBe(true)
    if (!r2.isRight()) return
    expect(
      r2.value.state.combatants.find((c) => c.characterId === 'victim')!.currentHp
    ).toBe(85)

    const r3 = submitPlayerAction(r2.value.state, {
      characterId: 'attacker',
      skillId: 'wait',
    })
    expect(r3.isRight()).toBe(true)
    if (!r3.isRight()) return
    // the effect has now ticked down through 3 of victim's own turns -> reverted
    expect(
      r3.value.state.combatants.find((c) => c.characterId === 'victim')!.currentHp
    ).toBe(100)
  })

  it('eliminates a character whose self-cost drops its own HP to 0', () => {
    const caster = makeCombatant({
      characterId: 'caster',
      teamNumber: 1,
      controlledBy: 'PLAYER',
      currentHp: 10,
      maxHp: 10,
      skillIds: ['costly'],
    })
    const enemy = makeCombatant({ characterId: 'enemy', teamNumber: 2, skillIds: [] })

    const skillsMap: Record<string, SkillLike> = {
      costly: { ...selfSkip, debuffValue: 10, debuffDuration: 2 },
    }

    const { state } = createPveSession([caster, enemy], skillsMap, 10)

    const result = submitPlayerAction(state, { characterId: 'caster', skillId: 'costly' })
    expect(result.isRight()).toBe(true)
    if (!result.isRight()) return

    const updatedCaster = result.value.state.combatants.find(
      (c) => c.characterId === 'caster'
    )!
    expect(updatedCaster.currentHp).toBe(0)
    expect(updatedCaster.isAlive).toBe(false)
    expect(result.value.state.status).toBe('FINISHED')
    expect(result.value.state.winnerTeam).toBe(2)
  })
})
