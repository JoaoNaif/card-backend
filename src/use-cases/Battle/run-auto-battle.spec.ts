import { beforeEach, describe, expect, it } from 'vitest'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'
import { StatType, TargetType } from '../../entities/skill'
import { InMemoryBattleFieldRepository } from '../../repositories/test/in-memory-battle-field-repository'
import { InMemoryBattleParticipantRepository } from '../../repositories/test/in-memory-battle-participant-repository'
import { InMemoryBattleRepository } from '../../repositories/test/in-memory-battle-repository'
import { InMemoryBattleTeamRepository } from '../../repositories/test/in-memory-battle-team-repository'
import { InMemoryCharacterRepository } from '../../repositories/test/in-memory-character-repository'
import { InMemorySkillRepository } from '../../repositories/test/in-memory-skill-repository'
import { makeBattleField } from '../../repositories/test/factories/make-battle-field'
import { makeCharacter } from '../../repositories/test/factories/make-character'
import { makeSkill } from '../../repositories/test/factories/make-skill'
import { RunAutoBattleUseCase } from './run-auto-battle'

let battleRepository: InMemoryBattleRepository
let battleTeamRepository: InMemoryBattleTeamRepository
let battleParticipantRepository: InMemoryBattleParticipantRepository
let characterRepository: InMemoryCharacterRepository
let skillRepository: InMemorySkillRepository
let battleFieldRepository: InMemoryBattleFieldRepository
let sut: RunAutoBattleUseCase

describe('RunAutoBattleUseCase', () => {
  beforeEach(() => {
    battleRepository = new InMemoryBattleRepository()
    battleTeamRepository = new InMemoryBattleTeamRepository()
    battleParticipantRepository = new InMemoryBattleParticipantRepository()
    characterRepository = new InMemoryCharacterRepository()
    skillRepository = new InMemorySkillRepository()
    battleFieldRepository = new InMemoryBattleFieldRepository()
    sut = new RunAutoBattleUseCase(
      battleRepository,
      battleTeamRepository,
      battleParticipantRepository,
      characterRepository,
      skillRepository,
      battleFieldRepository
    )
  })

  function linkSkill(characterId: string, skillId: string) {
    const current = skillRepository.characterSkillsMap.get(characterId) ?? []
    skillRepository.characterSkillsMap.set(characterId, [...current, skillId])
  }

  it('should run the battle and persist battle, teams and participants', async () => {
    const battleField = makeBattleField()
    await battleFieldRepository.create(battleField)

    // team1: high ATK and SPD so they always go first and kill quickly
    const charA1 = makeCharacter({ baseHp: 100, baseAtk: 50, baseDef: 10, baseSpd: 10 })
    const charA2 = makeCharacter({ baseHp: 100, baseAtk: 50, baseDef: 10, baseSpd: 10 })
    // team2: 1 HP so they die on the first hit
    const charB1 = makeCharacter({ baseHp: 1, baseAtk: 1, baseDef: 1, baseSpd: 1 })
    const charB2 = makeCharacter({ baseHp: 1, baseAtk: 1, baseDef: 1, baseSpd: 1 })

    for (const c of [charA1, charA2, charB1, charB2]) {
      await characterRepository.create(c)
    }

    const attackSkill = makeSkill({
      damageMultiplier: 2.0,
      healMultiplier: 0,
      targetType: TargetType.SINGLE_ENEMY,
      debuffStat: StatType.ATK,
      debuffValue: 0,
      debuffDuration: 1,
      cooldownTurns: 0,
    })
    await skillRepository.create(attackSkill)
    linkSkill(charA1.id.toString(), attackSkill.id.toString())
    linkSkill(charA2.id.toString(), attackSkill.id.toString())

    const result = await sut.execute({
      team1: {
        members: [
          { characterId: charA1.id.toString(), positionRow: 0, positionCol: 0 },
          { characterId: charA2.id.toString(), positionRow: 0, positionCol: 1 },
        ],
      },
      team2: {
        members: [
          { characterId: charB1.id.toString(), positionRow: 0, positionCol: 0 },
          { characterId: charB2.id.toString(), positionRow: 0, positionCol: 1 },
        ],
      },
      battleFieldId: battleField.id.toString(),
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(result.value.winnerTeam).toBe(1)
      expect(result.value.totalTurns).toBeGreaterThan(0)
      expect(result.value.log.length).toBeGreaterThan(0)
      expect(result.value.battleId).toBeDefined()
    }

    expect(battleRepository.items).toHaveLength(1)
    expect(battleRepository.items[0]?.winnerTerm).toBe(1)

    expect(battleTeamRepository.items).toHaveLength(2)
    expect(battleTeamRepository.items[0]?.teamNumber).toBe(1)
    expect(battleTeamRepository.items[1]?.teamNumber).toBe(2)

    expect(battleParticipantRepository.items).toHaveLength(4)
  })

  it('should use a random battle field when battleFieldId is not provided', async () => {
    const battleField = makeBattleField()
    await battleFieldRepository.create(battleField)

    const charA = makeCharacter({ baseHp: 100, baseAtk: 50, baseSpd: 10 })
    const charB = makeCharacter({ baseHp: 1, baseAtk: 1, baseSpd: 1 })
    await characterRepository.create(charA)
    await characterRepository.create(charB)

    const result = await sut.execute({
      team1: { members: [{ characterId: charA.id.toString(), positionRow: 0, positionCol: 0 }] },
      team2: { members: [{ characterId: charB.id.toString(), positionRow: 0, positionCol: 0 }] },
    })

    expect(result.isRight()).toBe(true)
    expect(battleRepository.items[0]?.battleFieldId).toBe(battleField.id.toString())
  })

  it('should return error when no battle field exists and none is provided', async () => {
    const charA = makeCharacter()
    const charB = makeCharacter()
    await characterRepository.create(charA)
    await characterRepository.create(charB)

    const result = await sut.execute({
      team1: { members: [{ characterId: charA.id.toString(), positionRow: 0, positionCol: 0 }] },
      team2: { members: [{ characterId: charB.id.toString(), positionRow: 0, positionCol: 0 }] },
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should return error when battleFieldId does not exist', async () => {
    const charA = makeCharacter()
    const charB = makeCharacter()
    await characterRepository.create(charA)
    await characterRepository.create(charB)

    const result = await sut.execute({
      team1: { members: [{ characterId: charA.id.toString(), positionRow: 0, positionCol: 0 }] },
      team2: { members: [{ characterId: charB.id.toString(), positionRow: 0, positionCol: 0 }] },
      battleFieldId: 'non-existent',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should return error when a character does not exist', async () => {
    const battleField = makeBattleField()
    await battleFieldRepository.create(battleField)

    const charA = makeCharacter()
    await characterRepository.create(charA)

    const result = await sut.execute({
      team1: { members: [{ characterId: charA.id.toString(), positionRow: 0, positionCol: 0 }] },
      team2: { members: [{ characterId: 'non-existent', positionRow: 0, positionCol: 0 }] },
      battleFieldId: battleField.id.toString(),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should end in draw at maxTurns when nobody has skills', async () => {
    const battleField = makeBattleField()
    await battleFieldRepository.create(battleField)

    // no skills → everyone skips → draw at maxTurns
    const charA = makeCharacter({ baseHp: 10000, baseAtk: 1 })
    const charB = makeCharacter({ baseHp: 10000, baseAtk: 1 })
    await characterRepository.create(charA)
    await characterRepository.create(charB)

    const result = await sut.execute({
      team1: { members: [{ characterId: charA.id.toString(), positionRow: 0, positionCol: 0 }] },
      team2: { members: [{ characterId: charB.id.toString(), positionRow: 0, positionCol: 0 }] },
      battleFieldId: battleField.id.toString(),
      maxTurns: 3,
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.winnerTeam).toBeNull()
      expect(result.value.totalTurns).toBe(3)
    }
    expect(battleRepository.items[0]?.maxTurns).toBe(3)
  })

  it('should link participants to the correct teams with correct positions', async () => {
    const battleField = makeBattleField()
    await battleFieldRepository.create(battleField)

    const charA = makeCharacter()
    const charB = makeCharacter()
    await characterRepository.create(charA)
    await characterRepository.create(charB)

    await sut.execute({
      team1: {
        userId: 'user-1',
        members: [{ characterId: charA.id.toString(), positionRow: 1, positionCol: 2 }],
      },
      team2: {
        userId: 'user-2',
        members: [{ characterId: charB.id.toString(), positionRow: 0, positionCol: 0 }],
      },
      battleFieldId: battleField.id.toString(),
    })

    const team1 = battleTeamRepository.items.find((t) => t.teamNumber === 1)
    const team2 = battleTeamRepository.items.find((t) => t.teamNumber === 2)

    expect(team1?.userId).toBe('user-1')
    expect(team2?.userId).toBe('user-2')

    const participantA = battleParticipantRepository.items.find(
      (p) => p.characterId === charA.id.toString()
    )
    expect(participantA?.battleTeamId).toBe(team1?.id.toString())
    expect(participantA?.positionRow).toBe(1)
    expect(participantA?.positionCol).toBe(2)
  })

  it('should apply dual power debuff multiplier (1.25x) for characters with secondary power', async () => {
    const battleField = makeBattleField()
    await battleFieldRepository.create(battleField)

    const dualPowerChar = makeCharacter({
      baseHp: 100,
      baseAtk: 10,
      baseSpd: 10,
      secondaryPowerId: 'some-power-id',
    })
    const target = makeCharacter({ baseHp: 1000, baseAtk: 1, baseSpd: 1 })
    await characterRepository.create(dualPowerChar)
    await characterRepository.create(target)

    // debuffValue = 10 → should be stored as -13 (ceil(10 * 1.25) = 13) for dual power
    const skill = makeSkill({
      damageMultiplier: 0,
      healMultiplier: 0,
      targetType: TargetType.SELF,
      debuffStat: StatType.ATK,
      debuffValue: 10,
      debuffDuration: 1,
      cooldownTurns: 0,
    })
    await skillRepository.create(skill)
    linkSkill(dualPowerChar.id.toString(), skill.id.toString())

    const result = await sut.execute({
      team1: {
        members: [{ characterId: dualPowerChar.id.toString(), positionRow: 0, positionCol: 0 }],
      },
      team2: {
        members: [{ characterId: target.id.toString(), positionRow: 0, positionCol: 0 }],
      },
      battleFieldId: battleField.id.toString(),
      maxTurns: 1,
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      const firstTurn = JSON.parse(result.value.log[0]!)
      const action = firstTurn.actions[0]
      // -round(10 * 1.25) = -13
      expect(action.selfDebuff.value).toBe(-13)
    }
  })

  it('applies battle field modifiers to combatants with a matching trait', async () => {
    const battleField = makeBattleField({
      modifiers: [
        {
          id: 'mod-1',
          traitId: 'trait-fire',
          traitName: 'Fire',
          stat: 'ATK',
          bonusType: 'PERCENT',
          bonusValue: 100,
        },
      ],
    })
    await battleFieldRepository.create(battleField)

    const attacker = makeCharacter({
      baseHp: 100,
      baseAtk: 10,
      baseDef: 10,
      baseSpd: 10,
      traits: [{ id: 'trait-fire', name: 'Fire' }],
    })
    const target = makeCharacter({ baseHp: 1000, baseAtk: 1, baseDef: 0, baseSpd: 1 })
    await characterRepository.create(attacker)
    await characterRepository.create(target)

    const skill = makeSkill({
      damageMultiplier: 1,
      healMultiplier: 0,
      targetType: TargetType.SINGLE_ENEMY,
      debuffStat: StatType.ATK,
      debuffValue: 0,
      debuffDuration: 1,
      cooldownTurns: 0,
    })
    await skillRepository.create(skill)
    linkSkill(attacker.id.toString(), skill.id.toString())

    const result = await sut.execute({
      team1: { members: [{ characterId: attacker.id.toString(), positionRow: 0, positionCol: 0 }] },
      team2: { members: [{ characterId: target.id.toString(), positionRow: 0, positionCol: 0 }] },
      battleFieldId: battleField.id.toString(),
      maxTurns: 1,
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      const firstTurn = JSON.parse(result.value.log[0]!)
      const action = firstTurn.actions[0]
      // base ATK 10 boosted +100% by the field's "Fire" modifier -> effective ATK 20
      // targetDef 0 -> calcDamage(20, 0) = 20
      expect(action.damage).toBe(20)
    }
  })

  it('does not apply battle field modifiers when the character lacks the trait', async () => {
    const battleField = makeBattleField({
      modifiers: [
        {
          id: 'mod-1',
          traitId: 'trait-fire',
          traitName: 'Fire',
          stat: 'ATK',
          bonusType: 'PERCENT',
          bonusValue: 100,
        },
      ],
    })
    await battleFieldRepository.create(battleField)

    const attacker = makeCharacter({
      baseHp: 100,
      baseAtk: 10,
      baseDef: 10,
      baseSpd: 10,
      traits: [{ id: 'trait-ice', name: 'Ice' }],
    })
    const target = makeCharacter({ baseHp: 1000, baseAtk: 1, baseDef: 0, baseSpd: 1 })
    await characterRepository.create(attacker)
    await characterRepository.create(target)

    const skill = makeSkill({
      damageMultiplier: 1,
      healMultiplier: 0,
      targetType: TargetType.SINGLE_ENEMY,
      debuffStat: StatType.ATK,
      debuffValue: 0,
      debuffDuration: 1,
      cooldownTurns: 0,
    })
    await skillRepository.create(skill)
    linkSkill(attacker.id.toString(), skill.id.toString())

    const result = await sut.execute({
      team1: { members: [{ characterId: attacker.id.toString(), positionRow: 0, positionCol: 0 }] },
      team2: { members: [{ characterId: target.id.toString(), positionRow: 0, positionCol: 0 }] },
      battleFieldId: battleField.id.toString(),
      maxTurns: 1,
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      const firstTurn = JSON.parse(result.value.log[0]!)
      const action = firstTurn.actions[0]
      // trait doesn't match the field modifier -> ATK stays at base 10
      expect(action.damage).toBe(10)
    }
  })
})
