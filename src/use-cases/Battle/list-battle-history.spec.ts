import { beforeEach, describe, expect, it } from 'vitest'
import { Battle, BattleMode, BattleStatus } from '../../entities/battle'
import { BattleTeam } from '../../entities/battle-team'
import { InMemoryBattleRepository } from '../../repositories/test/in-memory-battle-repository'
import { InMemoryBattleTeamRepository } from '../../repositories/test/in-memory-battle-team-repository'
import { InMemoryUserRepository } from '../../repositories/test/in-memory-user-repository'
import { makeUser } from '../../repositories/test/factories/make-user'
import { ListBattleHistoryUseCase } from './list-battle-history'

let battleRepository: InMemoryBattleRepository
let battleTeamRepository: InMemoryBattleTeamRepository
let userRepository: InMemoryUserRepository
let sut: ListBattleHistoryUseCase

describe('ListBattleHistoryUseCase', () => {
  beforeEach(() => {
    battleRepository = new InMemoryBattleRepository()
    battleTeamRepository = new InMemoryBattleTeamRepository()
    userRepository = new InMemoryUserRepository()
    sut = new ListBattleHistoryUseCase(
      battleTeamRepository,
      battleRepository,
      userRepository
    )
  })

  it('should list battles the user took part in, most recent first', async () => {
    const me = makeUser()
    const opponent = makeUser({ name: 'Rival' })
    await userRepository.create(me)
    await userRepository.create(opponent)

    const olderBattle = Battle.create({
      mode: BattleMode.AUTO,
      status: BattleStatus.COMPLETED,
      battleFieldId: 'field-1',
      winnerTerm: 1,
      totalTurns: 5,
      log: [],
      createdAt: new Date('2026-01-01'),
    })
    const newerBattle = Battle.create({
      mode: BattleMode.AUTO,
      status: BattleStatus.COMPLETED,
      battleFieldId: 'field-1',
      winnerTerm: 2,
      totalTurns: 8,
      log: [],
      createdAt: new Date('2026-02-01'),
    })
    await battleRepository.create(olderBattle)
    await battleRepository.create(newerBattle)

    // olderBattle: me = team1 (winner) -> WIN
    await battleTeamRepository.create(
      BattleTeam.create({
        battleId: olderBattle.id.toString(),
        teamNumber: 1,
        userId: me.id.toString(),
      })
    )
    await battleTeamRepository.create(
      BattleTeam.create({
        battleId: olderBattle.id.toString(),
        teamNumber: 2,
        userId: opponent.id.toString(),
      })
    )

    // newerBattle: me = team1, winner = team2 -> LOSS, opponent is a machine (no userId)
    await battleTeamRepository.create(
      BattleTeam.create({
        battleId: newerBattle.id.toString(),
        teamNumber: 1,
        userId: me.id.toString(),
      })
    )
    await battleTeamRepository.create(
      BattleTeam.create({
        battleId: newerBattle.id.toString(),
        teamNumber: 2,
        userId: null,
      })
    )

    const result = await sut.execute({ userId: me.id.toString() })

    expect(result.isRight()).toBe(true)
    if (!result.isRight()) return

    expect(result.value.battles).toHaveLength(2)

    const [first, second] = result.value.battles

    expect(first!.battleId).toBe(newerBattle.id.toString())
    expect(first!.outcome).toBe('LOSS')
    expect(first!.myTeamNumber).toBe(1)
    expect(first!.opponent).toEqual({ userId: null, name: null })

    expect(second!.battleId).toBe(olderBattle.id.toString())
    expect(second!.outcome).toBe('WIN')
    expect(second!.opponent).toEqual({
      userId: opponent.id.toString(),
      name: 'Rival',
    })
  })

  it('should return an empty list when the user has no battles', async () => {
    const result = await sut.execute({ userId: 'nobody' })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.battles).toEqual([])
    }
  })

  it('should not return battles the user is not part of', async () => {
    const me = makeUser()
    const playerA = makeUser({ name: 'Player A' })
    const playerB = makeUser({ name: 'Player B' })
    await userRepository.create(me)
    await userRepository.create(playerA)
    await userRepository.create(playerB)

    const battle = Battle.create({
      mode: BattleMode.AUTO,
      status: BattleStatus.COMPLETED,
      battleFieldId: 'field-1',
      winnerTerm: 1,
      totalTurns: 4,
      log: [],
    })
    await battleRepository.create(battle)

    await battleTeamRepository.create(
      BattleTeam.create({
        battleId: battle.id.toString(),
        teamNumber: 1,
        userId: playerA.id.toString(),
      })
    )
    await battleTeamRepository.create(
      BattleTeam.create({
        battleId: battle.id.toString(),
        teamNumber: 2,
        userId: playerB.id.toString(),
      })
    )

    const result = await sut.execute({ userId: me.id.toString() })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.battles).toEqual([])
    }
  })

  it('should return the full battle metadata for each history item', async () => {
    const me = makeUser()
    await userRepository.create(me)

    const battle = Battle.create({
      mode: BattleMode.AUTO,
      status: BattleStatus.COMPLETED,
      battleFieldId: 'field-1',
      winnerTerm: 1,
      totalTurns: 7,
      log: [],
      createdAt: new Date('2026-03-01'),
    })
    await battleRepository.create(battle)

    await battleTeamRepository.create(
      BattleTeam.create({
        battleId: battle.id.toString(),
        teamNumber: 1,
        userId: me.id.toString(),
      })
    )
    await battleTeamRepository.create(
      BattleTeam.create({
        battleId: battle.id.toString(),
        teamNumber: 2,
        userId: null,
      })
    )

    const result = await sut.execute({ userId: me.id.toString() })

    expect(result.isRight()).toBe(true)
    if (!result.isRight()) return

    expect(result.value.battles[0]).toEqual({
      battleId: battle.id.toString(),
      mode: BattleMode.AUTO,
      status: BattleStatus.COMPLETED,
      createdAt: battle.createdAt,
      totalTurns: 7,
      myTeamNumber: 1,
      outcome: 'WIN',
      opponent: { userId: null, name: null },
    })
  })

  it('should mark the outcome as DRAW when the battle has no winner', async () => {
    const me = makeUser()
    await userRepository.create(me)

    const battle = Battle.create({
      mode: BattleMode.AUTO,
      status: BattleStatus.COMPLETED,
      battleFieldId: 'field-1',
      winnerTerm: null,
      totalTurns: 3,
      log: [],
    })
    await battleRepository.create(battle)

    await battleTeamRepository.create(
      BattleTeam.create({
        battleId: battle.id.toString(),
        teamNumber: 1,
        userId: me.id.toString(),
      })
    )
    await battleTeamRepository.create(
      BattleTeam.create({
        battleId: battle.id.toString(),
        teamNumber: 2,
        userId: null,
      })
    )

    const result = await sut.execute({ userId: me.id.toString() })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.battles[0]!.outcome).toBe('DRAW')
    }
  })
})
