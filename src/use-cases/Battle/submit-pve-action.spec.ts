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
import { InvalidBattleActionError } from './err/invalid-battle-action-error'
import { StartPveBattleUseCase } from './start-pve-battle'
import { SubmitPveActionUseCase } from './submit-pve-action'

let battleRepository: InMemoryBattleRepository
let battleTeamRepository: InMemoryBattleTeamRepository
let battleParticipantRepository: InMemoryBattleParticipantRepository
let characterRepository: InMemoryCharacterRepository
let skillRepository: InMemorySkillRepository
let battleFieldRepository: InMemoryBattleFieldRepository
let machineRepository: InMemoryMachineRepository
let machineMemberRepository: InMemoryMachineMemberRepository
let pveSessionRepository: InMemoryPveSessionRepository
let startUseCase: StartPveBattleUseCase
let sut: SubmitPveActionUseCase

describe('SubmitPveActionUseCase', () => {
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
    startUseCase = new StartPveBattleUseCase(
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
    sut = new SubmitPveActionUseCase(
      battleRepository,
      battleTeamRepository,
      battleFieldRepository,
      pveSessionRepository
    )
  })

  function linkSkill(characterId: string, skillId: string) {
    const current = skillRepository.characterSkillsMap.get(characterId) ?? []
    skillRepository.characterSkillsMap.set(characterId, [...current, skillId])
  }

  async function startBattle({
    playerSpd = 100,
    machineSpd = 10,
    playerHp = 1000,
    machineHp = 1000,
  } = {}) {
    const battleField = makeBattleField()
    await battleFieldRepository.create(battleField)

    const machine = Machine.create({ label: 'M1', name: 'Sentinela' })
    await machineRepository.create(machine)

    const aiChar = makeCharacter({
      baseHp: machineHp,
      baseAtk: 5,
      baseDef: 0,
      baseSpd: machineSpd,
      userId: null,
    })
    await characterRepository.create(aiChar)
    const aiSkill = makeSkill({
      damageMultiplier: 1,
      targetType: TargetType.SINGLE_ENEMY,
      debuffStat: StatType.ATK,
      debuffValue: 0,
      debuffDuration: 1,
      cooldownTurns: 0,
    })
    await skillRepository.create(aiSkill)
    linkSkill(aiChar.id.toString(), aiSkill.id.toString())

    await machineMemberRepository.create(
      MachineMember.create({
        machineId: machine.id.toString(),
        characterId: aiChar.id.toString(),
        positionRow: 0,
        positionCol: 0,
      })
    )

    const playerChar = makeCharacter({
      baseHp: playerHp,
      baseAtk: 10,
      baseDef: 0,
      baseSpd: playerSpd,
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

    const started = await startUseCase.execute({
      userId: 'user-1',
      machineId: machine.id.toString(),
      playerTeam: [
        { characterId: playerChar.id.toString(), positionRow: 0, positionCol: 0 },
      ],
      battleFieldId: battleField.id.toString(),
    })
    if (!started.isRight()) throw new Error('failed to start battle in test setup')

    return { battleId: started.value.battleId, playerChar, aiChar, playerSkill, aiSkill }
  }

  it('applies the player action, targets the given enemy, and persists the advanced state', async () => {
    const { battleId, playerChar, aiChar, playerSkill } = await startBattle()

    const result = await sut.execute({
      userId: 'user-1',
      battleId,
      characterId: playerChar.id.toString(),
      skillId: playerSkill.id.toString(),
      targetId: aiChar.id.toString(),
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(
        result.value.actions.some(
          (a) => a.actorId === playerChar.id.toString() && a.damage !== undefined
        )
      ).toBe(true)
    }

    const persisted = await battleRepository.findById(battleId)
    expect(persisted?.status).toBe('ACTIVE')
    expect(pveSessionRepository.items.get(battleId)).toBeDefined()
  })

  it('returns ResourceNotFoundError when the battle does not exist', async () => {
    const result = await sut.execute({
      userId: 'user-1',
      battleId: 'non-existing-battle',
      characterId: 'x',
      skillId: 'y',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('returns UnauthorizedError when the requester does not own team 1', async () => {
    const { battleId, playerChar, playerSkill } = await startBattle()

    const result = await sut.execute({
      userId: 'someone-else',
      battleId,
      characterId: playerChar.id.toString(),
      skillId: playerSkill.id.toString(),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(UnauthorizedError)
  })

  it("rejects an action submitted for a character whose turn it isn't", async () => {
    const { battleId, aiChar, playerSkill } = await startBattle()

    const result = await sut.execute({
      userId: 'user-1',
      battleId,
      characterId: aiChar.id.toString(),
      skillId: playerSkill.id.toString(),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(InvalidBattleActionError)
  })

  it('finishes the battle, updates status/winner, and clears sessionState once a side is defeated', async () => {
    const { battleId, playerChar, aiChar, playerSkill } = await startBattle({
      playerHp: 1000,
      machineHp: 1,
    })

    const result = await sut.execute({
      userId: 'user-1',
      battleId,
      characterId: playerChar.id.toString(),
      skillId: playerSkill.id.toString(),
      targetId: aiChar.id.toString(),
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.state.status).toBe('FINISHED')
      expect(result.value.state.winnerTeam).toBe(1)
    }

    const persisted = await battleRepository.findById(battleId)
    expect(persisted?.status).toBe('COMPLETED')
    expect(persisted?.winnerTerm).toBe(1)
    expect(pveSessionRepository.items.get(battleId)).toBeUndefined()

    const again = await sut.execute({
      userId: 'user-1',
      battleId,
      characterId: playerChar.id.toString(),
      skillId: playerSkill.id.toString(),
      targetId: aiChar.id.toString(),
    })
    expect(again.isLeft()).toBe(true)
    expect(again.value).toBeInstanceOf(InvalidBattleActionError)
  })
})
