import { beforeEach, describe, expect, it } from 'vitest'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'
import { UnauthorizedError } from '../../core/error/err/unauthorized-error'
import { Machine } from '../../entities/machine'
import { MachineMember } from '../../entities/machine-member'
import { StatType, TargetType } from '../../entities/skill'
import { InMemoryBattleFieldRepository } from '../../repositories/test/in-memory-battle-field-repository'
import { InMemoryBattleParticipantRepository } from '../../repositories/test/in-memory-battle-participant-repository'
import { InMemoryBattleRepository } from '../../repositories/test/in-memory-battle-repository'
import { InMemoryBattleTeamRepository } from '../../repositories/test/in-memory-battle-team-repository'
import { InMemoryCharacterRepository } from '../../repositories/test/in-memory-character-repository'
import { InMemoryMachineMemberRepository } from '../../repositories/test/in-memory-machine-member-repository'
import { InMemoryMachineRepository } from '../../repositories/test/in-memory-machine-repository'
import { InMemoryPveSessionRepository } from '../../repositories/test/in-memory-pve-session-repository'
import { InMemorySkillRepository } from '../../repositories/test/in-memory-skill-repository'
import { makeBattleField } from '../../repositories/test/factories/make-battle-field'
import { makeCharacter } from '../../repositories/test/factories/make-character'
import { makeSkill } from '../../repositories/test/factories/make-skill'
import { InvalidTeamCompositionError } from './err/invalid-team-composition-error'
import { StartPveBattleUseCase } from './start-pve-battle'

let battleRepository: InMemoryBattleRepository
let battleTeamRepository: InMemoryBattleTeamRepository
let battleParticipantRepository: InMemoryBattleParticipantRepository
let characterRepository: InMemoryCharacterRepository
let skillRepository: InMemorySkillRepository
let battleFieldRepository: InMemoryBattleFieldRepository
let machineRepository: InMemoryMachineRepository
let machineMemberRepository: InMemoryMachineMemberRepository
let pveSessionRepository: InMemoryPveSessionRepository
let sut: StartPveBattleUseCase

describe('StartPveBattleUseCase', () => {
  beforeEach(() => {
    battleRepository = new InMemoryBattleRepository()
    battleTeamRepository = new InMemoryBattleTeamRepository()
    battleParticipantRepository = new InMemoryBattleParticipantRepository()
    characterRepository = new InMemoryCharacterRepository()
    skillRepository = new InMemorySkillRepository()
    battleFieldRepository = new InMemoryBattleFieldRepository()
    machineRepository = new InMemoryMachineRepository()
    machineMemberRepository = new InMemoryMachineMemberRepository()
    pveSessionRepository = new InMemoryPveSessionRepository()
    sut = new StartPveBattleUseCase(
      battleRepository,
      battleTeamRepository,
      battleParticipantRepository,
      characterRepository,
      skillRepository,
      battleFieldRepository,
      machineRepository,
      machineMemberRepository,
      pveSessionRepository
    )
  })

  function linkSkill(characterId: string, skillId: string) {
    const current = skillRepository.characterSkillsMap.get(characterId) ?? []
    skillRepository.characterSkillsMap.set(characterId, [...current, skillId])
  }

  async function setupMachine(spd: number) {
    const machine = Machine.create({ label: 'M1', name: 'Sentinela' })
    await machineRepository.create(machine)

    const aiChar = makeCharacter({ baseHp: 100, baseAtk: 5, baseSpd: spd, userId: null })
    await characterRepository.create(aiChar)

    const skill = makeSkill({
      damageMultiplier: 1,
      targetType: TargetType.SINGLE_ENEMY,
      debuffStat: StatType.ATK,
      debuffValue: 0,
      debuffDuration: 1,
      cooldownTurns: 0,
    })
    await skillRepository.create(skill)
    linkSkill(aiChar.id.toString(), skill.id.toString())

    const member = MachineMember.create({
      machineId: machine.id.toString(),
      characterId: aiChar.id.toString(),
      positionRow: 0,
      positionCol: 0,
    })
    await machineMemberRepository.create(member)

    return { machine, aiChar }
  }

  it('starts a PvE battle and pauses on the player character when it is faster than the machine', async () => {
    const battleField = makeBattleField()
    await battleFieldRepository.create(battleField)

    const { machine } = await setupMachine(10)

    const playerChar = makeCharacter({
      baseHp: 100,
      baseAtk: 10,
      baseSpd: 100,
      userId: 'user-1',
    })
    await characterRepository.create(playerChar)

    const playerSkill = makeSkill({
      damageMultiplier: 1,
      targetType: TargetType.SINGLE_ENEMY,
      debuffStat: StatType.ATK,
      debuffValue: 0,
      debuffDuration: 1,
      cooldownTurns: 0,
    })
    await skillRepository.create(playerSkill)
    linkSkill(playerChar.id.toString(), playerSkill.id.toString())

    const result = await sut.execute({
      userId: 'user-1',
      machineId: machine.id.toString(),
      playerTeam: [
        { characterId: playerChar.id.toString(), positionRow: 0, positionCol: 0 },
      ],
      battleFieldId: battleField.id.toString(),
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.state.status).toBe('ACTIVE')
      expect(result.value.state.awaitingCharacterId).toBe(playerChar.id.toString())

      const availableSkill = result.value.state.availableSkills[0]
      expect(availableSkill?.skillId).toBe(playerSkill.id.toString())
      expect(availableSkill?.targetType).toBe(TargetType.SINGLE_ENEMY)
      // playerChar effectiveAtk = 10 (level 1), damageMultiplier = 1
      expect(availableSkill?.estimatedDamage).toBe(10)
      expect(availableSkill?.estimatedHeal).toBeNull()
      expect(availableSkill?.cooldownTurns).toBe(0)
      expect(availableSkill?.cost).toEqual({ stat: StatType.ATK, value: 0, duration: 1 })

      expect(result.value.state.battleField).toEqual({
        id: battleField.id.toString(),
        name: battleField.name,
        description: battleField.description,
        modifiers: battleField.modifiers,
      })
    }

    expect(battleRepository.items).toHaveLength(1)
    expect(battleRepository.items[0]?.mode).toBe('PVE')
    expect(battleRepository.items[0]?.status).toBe('ACTIVE')
    expect(
      pveSessionRepository.items.get(battleRepository.items[0]!.id.toString())
    ).toBeDefined()

    expect(battleTeamRepository.items).toHaveLength(2)
    const playerTeam = battleTeamRepository.items.find((t) => t.teamNumber === 1)
    const aiTeam = battleTeamRepository.items.find((t) => t.teamNumber === 2)
    expect(playerTeam?.userId).toBe('user-1')
    expect(aiTeam?.userId).toBeNull()

    expect(battleParticipantRepository.items).toHaveLength(2)
  })

  it('auto-resolves the machine turn first when it is faster, without asking the player', async () => {
    const battleField = makeBattleField()
    await battleFieldRepository.create(battleField)

    const { machine, aiChar } = await setupMachine(200)

    const playerChar = makeCharacter({
      baseHp: 1000,
      baseAtk: 5,
      baseDef: 100,
      baseSpd: 10,
      userId: 'user-1',
    })
    await characterRepository.create(playerChar)

    const playerSkill = makeSkill({
      damageMultiplier: 1,
      targetType: TargetType.SINGLE_ENEMY,
      debuffStat: StatType.ATK,
      debuffValue: 0,
      debuffDuration: 1,
      cooldownTurns: 0,
    })
    await skillRepository.create(playerSkill)
    linkSkill(playerChar.id.toString(), playerSkill.id.toString())

    const result = await sut.execute({
      userId: 'user-1',
      machineId: machine.id.toString(),
      playerTeam: [
        { characterId: playerChar.id.toString(), positionRow: 0, positionCol: 0 },
      ],
      battleFieldId: battleField.id.toString(),
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      // the AI already acted (round still in progress) — the log should show it
      expect(result.value.actions.some((a) => a.actorId === aiChar.id.toString())).toBe(
        true
      )
      expect(result.value.state.awaitingCharacterId).toBe(playerChar.id.toString())
    }
  })

  it('returns UnauthorizedError when a player character does not belong to the user', async () => {
    const battleField = makeBattleField()
    await battleFieldRepository.create(battleField)

    const { machine } = await setupMachine(10)

    const playerChar = makeCharacter({ userId: 'someone-else' })
    await characterRepository.create(playerChar)

    const result = await sut.execute({
      userId: 'user-1',
      machineId: machine.id.toString(),
      playerTeam: [
        { characterId: playerChar.id.toString(), positionRow: 0, positionCol: 0 },
      ],
      battleFieldId: battleField.id.toString(),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(UnauthorizedError)
    expect(battleRepository.items).toHaveLength(0)
  })

  it('returns ResourceNotFoundError when the machine does not exist', async () => {
    const battleField = makeBattleField()
    await battleFieldRepository.create(battleField)

    const playerChar = makeCharacter({ userId: 'user-1' })
    await characterRepository.create(playerChar)

    const result = await sut.execute({
      userId: 'user-1',
      machineId: 'non-existing-machine',
      playerTeam: [
        { characterId: playerChar.id.toString(), positionRow: 0, positionCol: 0 },
      ],
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('returns InvalidTeamCompositionError when the player team is empty', async () => {
    const { machine } = await setupMachine(10)

    const result = await sut.execute({
      userId: 'user-1',
      machineId: machine.id.toString(),
      playerTeam: [],
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(InvalidTeamCompositionError)
  })
})
