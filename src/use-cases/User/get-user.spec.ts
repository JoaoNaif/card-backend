import { describe, it, expect, beforeEach } from 'vitest'
import { InMemoryUserRepository } from '../../repositories/test/in-memory-user-repository'
import { InMemoryCharacterRepository } from '../../repositories/test/in-memory-character-repository'
import { InMemoryBattleTeamRepository } from '../../repositories/test/in-memory-battle-team-repository'
import { InMemoryBattleRepository } from '../../repositories/test/in-memory-battle-repository'
import { GetUserUseCase } from './get-user'
import { makeUser } from '../../repositories/test/factories/make-user'
import { makeCharacter } from '../../repositories/test/factories/make-character'
import { makeBattle } from '../../repositories/test/factories/make-battle'
import { BattleStatus } from '../../entities/battle'
import { BattleTeam } from '../../entities/battle-team'

let userRepository: InMemoryUserRepository
let characterRepository: InMemoryCharacterRepository
let battleTeamRepository: InMemoryBattleTeamRepository
let battleRepository: InMemoryBattleRepository
let sut: GetUserUseCase

describe('GetUserUseCase', () => {
  beforeEach(() => {
    userRepository = new InMemoryUserRepository()
    characterRepository = new InMemoryCharacterRepository()
    battleTeamRepository = new InMemoryBattleTeamRepository()
    battleRepository = new InMemoryBattleRepository()
    sut = new GetUserUseCase(
      userRepository,
      characterRepository,
      battleTeamRepository,
      battleRepository
    )
  })

  it('should create a user successfully', async () => {
    const user = makeUser({
      email: 'john@example.com',
      name: 'John Doe',
    })

    await userRepository.create(user)

    const result = await sut.execute({
      id: user.id.toString(),
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(result.value.user.name).toBe('John Doe')
      expect(result.value.user.email).toBe('john@example.com')
      expect(result.value.user.id).toBeDefined()
      expect(result.value.user.createdAt).toBeInstanceOf(Date)
      expect(result.value.user.stats).toEqual({
        rosterCount: 0,
        battlesPlayed: 0,
        wins: 0,
        winRate: 0,
      })
    }
  })

  it('should compute roster count, battles played and win rate', async () => {
    const user = makeUser()
    await userRepository.create(user)

    await characterRepository.create(
      makeCharacter({ userId: user.id.toString() })
    )
    await characterRepository.create(
      makeCharacter({ userId: user.id.toString() })
    )

    const wonBattle = makeBattle({
      status: BattleStatus.COMPLETED,
      winnerTerm: 1,
    })
    const lostBattle = makeBattle({
      status: BattleStatus.COMPLETED,
      winnerTerm: 2,
    })
    const abandonedBattle = makeBattle({ status: BattleStatus.ABANDONED })

    await battleRepository.create(wonBattle)
    await battleRepository.create(lostBattle)
    await battleRepository.create(abandonedBattle)

    await battleTeamRepository.create(
      BattleTeam.create({
        battleId: wonBattle.id.toString(),
        teamNumber: 1,
        userId: user.id.toString(),
      })
    )
    await battleTeamRepository.create(
      BattleTeam.create({
        battleId: lostBattle.id.toString(),
        teamNumber: 1,
        userId: user.id.toString(),
      })
    )
    await battleTeamRepository.create(
      BattleTeam.create({
        battleId: abandonedBattle.id.toString(),
        teamNumber: 1,
        userId: user.id.toString(),
      })
    )

    const result = await sut.execute({ id: user.id.toString() })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.user.stats).toEqual({
        rosterCount: 2,
        battlesPlayed: 2,
        wins: 1,
        winRate: 50,
      })
    }
  })
})
