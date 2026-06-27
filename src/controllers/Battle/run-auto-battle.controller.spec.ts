import { afterAll, afterEach, describe, expect, it } from 'vitest'
import request from 'supertest'
import app from '../../app'
import { prisma } from '../../config/prisma'

describe('POST /battle/auto (RunAutoBattleController)', () => {
  afterEach(async () => {
    // cascade order: Battle → BattleTeam → BattleParticipant
    await prisma.battle.deleteMany()
    // Character → CharacterSkill (cascade)
    await prisma.character.deleteMany()
    await prisma.user.deleteMany()
    await prisma.skill.deleteMany()
    await prisma.power.deleteMany()
    await prisma.battleField.deleteMany()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  // ── helpers ──────────────────────────────────────────────────────────────

  async function createPower() {
    return prisma.power.create({
      data: {
        name: `Power-${Date.now()}-${Math.random()}`,
        description: 'Test power',
        pillar: 'MATERIAL',
      },
    })
  }

  async function createBattleField() {
    return prisma.battleField.create({
      data: {
        name: `Field-${Date.now()}-${Math.random()}`,
        description: 'Test battle field',
      },
    })
  }

  async function createCharacter(
    powerId: string,
    override: Record<string, unknown> = {}
  ) {
    return prisma.character.create({
      data: {
        name: `Char-${Date.now()}-${Math.random()}`,
        description: 'Test character',
        ranking: 'DISCRETO',
        maxRanking: 'SINGULAR',
        level: 1,
        xp: 0,
        breakthroughAttempts: 0,
        baseHp: 100,
        baseAtk: 10,
        baseDef: 10,
        baseSpd: 10,
        powerId,
        ...override,
      },
    })
  }

  async function createSkill(
    powerId: string,
    override: Record<string, unknown> = {}
  ) {
    return prisma.skill.create({
      data: {
        name: `Skill-${Date.now()}-${Math.random()}`,
        description: 'Test skill',
        limitation: 'none',
        cooldownTurns: 0,
        debuffStat: 'ATK',
        debuffValue: 0,
        debuffDuration: 1,
        targetType: 'SINGLE_ENEMY',
        damageMultiplier: 1.0,
        healMultiplier: 0,
        minLevel: 1,
        powerId,
        ...override,
      },
    })
  }

  async function createUser() {
    return prisma.user.create({
      data: {
        email: `user-${Date.now()}-${Math.random()}@test.com`,
        name: 'Test User',
        passwordHash: 'hashed',
      },
    })
  }

  async function linkSkill(characterId: string, skillId: string) {
    return prisma.characterSkill.create({ data: { characterId, skillId } })
  }

  // ── tests ─────────────────────────────────────────────────────────────────

  it('should run auto battle and return 201 with battle result', async () => {
    const power = await createPower()
    const battleField = await createBattleField()

    // team1: high ATK and SPD so they act first and kill instantly
    const charA1 = await createCharacter(power.id, { baseAtk: 50, baseSpd: 10 })
    const charA2 = await createCharacter(power.id, { baseAtk: 50, baseSpd: 10 })
    // team2: 1 HP so they die on the first hit
    const charB1 = await createCharacter(power.id, { baseHp: 1, baseSpd: 1 })
    const charB2 = await createCharacter(power.id, { baseHp: 1, baseSpd: 1 })

    const skill = await createSkill(power.id, { damageMultiplier: 2.0 })
    await linkSkill(charA1.id, skill.id)
    await linkSkill(charA2.id, skill.id)

    const response = await request(app)
      .post('/battle/auto')
      .send({
        team1: {
          members: [
            { characterId: charA1.id, positionRow: 0, positionCol: 0 },
            { characterId: charA2.id, positionRow: 0, positionCol: 1 },
          ],
        },
        team2: {
          members: [
            { characterId: charB1.id, positionRow: 0, positionCol: 0 },
            { characterId: charB2.id, positionRow: 0, positionCol: 1 },
          ],
        },
        battleFieldId: battleField.id,
      })

    expect(response.status).toBe(201)
    expect(response.body).toMatchObject({
      battleId: expect.any(String),
      winnerTeam: 1,
      totalTurns: expect.any(Number),
      log: expect.any(Array),
    })
    expect(response.body.log.length).toBeGreaterThan(0)
  })

  it('should persist battle, teams and participants to the database', async () => {
    const power = await createPower()
    const battleField = await createBattleField()
    const user = await createUser()

    const charA = await createCharacter(power.id, { baseAtk: 50, baseSpd: 10 })
    const charB = await createCharacter(power.id, { baseHp: 1, baseSpd: 1 })

    const skill = await createSkill(power.id, { damageMultiplier: 2.0 })
    await linkSkill(charA.id, skill.id)

    const response = await request(app)
      .post('/battle/auto')
      .send({
        team1: {
          userId: user.id,
          members: [{ characterId: charA.id, positionRow: 0, positionCol: 0 }],
        },
        team2: {
          members: [{ characterId: charB.id, positionRow: 0, positionCol: 0 }],
        },
        battleFieldId: battleField.id,
      })

    expect(response.status).toBe(201)

    const battle = await prisma.battle.findFirst()
    expect(battle).not.toBeNull()
    expect(battle?.mode).toBe('AUTO')
    expect(battle?.status).toBe('COMPLETED')

    const teams = await prisma.battleTeam.findMany()
    expect(teams).toHaveLength(2)
    expect(teams.find((t) => t.teamNumber === 1)?.userId).toBe(user.id)

    const participants = await prisma.battleParticipant.findMany()
    expect(participants).toHaveLength(2)
  })

  it('should use a random battle field when battleFieldId is not provided', async () => {
    const power = await createPower()
    const battleField = await createBattleField()

    const charA = await createCharacter(power.id, { baseAtk: 50, baseSpd: 10 })
    const charB = await createCharacter(power.id, { baseHp: 1, baseSpd: 1 })

    const response = await request(app)
      .post('/battle/auto')
      .send({
        team1: { members: [{ characterId: charA.id, positionRow: 0, positionCol: 0 }] },
        team2: { members: [{ characterId: charB.id, positionRow: 0, positionCol: 0 }] },
      })

    expect(response.status).toBe(201)
    const battle = await prisma.battle.findFirst()
    expect(battle?.battleFieldId).toBe(battleField.id)
  })

  it('should return 400 when no battle field exists and none is provided', async () => {
    const power = await createPower()
    const charA = await createCharacter(power.id)
    const charB = await createCharacter(power.id)

    const response = await request(app)
      .post('/battle/auto')
      .send({
        team1: { members: [{ characterId: charA.id, positionRow: 0, positionCol: 0 }] },
        team2: { members: [{ characterId: charB.id, positionRow: 0, positionCol: 0 }] },
      })

    expect(response.status).toBe(400)
    expect(response.body.message).toBeDefined()
  })

  it('should return 400 when battleFieldId does not exist', async () => {
    const power = await createPower()
    const charA = await createCharacter(power.id)
    const charB = await createCharacter(power.id)

    const response = await request(app)
      .post('/battle/auto')
      .send({
        team1: { members: [{ characterId: charA.id, positionRow: 0, positionCol: 0 }] },
        team2: { members: [{ characterId: charB.id, positionRow: 0, positionCol: 0 }] },
        battleFieldId: 'non-existent',
      })

    expect(response.status).toBe(400)
    expect(response.body.message).toBeDefined()
  })

  it('should return 400 when a character does not exist', async () => {
    const power = await createPower()
    const battleField = await createBattleField()
    const charA = await createCharacter(power.id)

    const response = await request(app)
      .post('/battle/auto')
      .send({
        team1: { members: [{ characterId: charA.id, positionRow: 0, positionCol: 0 }] },
        team2: { members: [{ characterId: 'non-existent', positionRow: 0, positionCol: 0 }] },
        battleFieldId: battleField.id,
      })

    expect(response.status).toBe(400)
    expect(response.body.message).toBeDefined()
  })

  it('should end at maxTurns when characters have no skills', async () => {
    const power = await createPower()
    const battleField = await createBattleField()

    // no skills → everyone skips → draw at maxTurns
    const charA = await createCharacter(power.id, { baseHp: 10000 })
    const charB = await createCharacter(power.id, { baseHp: 10000 })

    const response = await request(app)
      .post('/battle/auto')
      .send({
        team1: { members: [{ characterId: charA.id, positionRow: 0, positionCol: 0 }] },
        team2: { members: [{ characterId: charB.id, positionRow: 0, positionCol: 0 }] },
        battleFieldId: battleField.id,
        maxTurns: 3,
      })

    expect(response.status).toBe(201)
    expect(response.body.totalTurns).toBe(3)
    expect(response.body.winnerTeam).toBeNull()
  })

  it('should return 400 when team1 is missing', async () => {
    const response = await request(app)
      .post('/battle/auto')
      .send({
        team2: { members: [{ characterId: 'some-id', positionRow: 0, positionCol: 0 }] },
      })

    expect(response.status).toBe(400)
    expect(response.body.errors).toBeDefined()
  })

  it('should return 400 when position is out of grid bounds (row > 2)', async () => {
    const response = await request(app)
      .post('/battle/auto')
      .send({
        team1: { members: [{ characterId: 'some-id', positionRow: 3, positionCol: 0 }] },
        team2: { members: [{ characterId: 'other-id', positionRow: 0, positionCol: 0 }] },
      })

    expect(response.status).toBe(400)
    expect(response.body.errors).toBeDefined()
  })

  it('should return 400 when team has more than 4 members', async () => {
    const response = await request(app)
      .post('/battle/auto')
      .send({
        team1: {
          members: Array.from({ length: 5 }, (_, i) => ({
            characterId: `char-${i}`,
            positionRow: 0,
            positionCol: i % 3,
          })),
        },
        team2: { members: [{ characterId: 'other-id', positionRow: 0, positionCol: 0 }] },
      })

    expect(response.status).toBe(400)
    expect(response.body.errors).toBeDefined()
  })
})
