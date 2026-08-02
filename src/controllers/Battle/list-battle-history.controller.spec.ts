import { afterAll, afterEach, describe, expect, it } from 'vitest'
import request from 'supertest'
import app from '../../app'
import { prisma } from '../../config/prisma'

describe('GET /battle/history (ListBattleHistoryController)', () => {
  afterEach(async () => {
    // cascade order: Battle → BattleTeam → BattleParticipant
    await prisma.battle.deleteMany()
    await prisma.user.deleteMany()
    await prisma.battleField.deleteMany()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  // ── helpers ──────────────────────────────────────────────────────────────

  async function createBattleField() {
    return prisma.battleField.create({
      data: {
        name: `Field-${Date.now()}-${Math.random()}`,
        description: 'Test battle field',
      },
    })
  }

  async function registerAndAuthenticate(email: string, name: string) {
    await request(app).post('/users').send({
      name,
      email,
      password: '123456',
    })

    const authResponse = await request(app)
      .post('/users/authenticate')
      .send({ email, password: '123456' })

    const cookie = authResponse.headers['set-cookie'] as unknown as string[]
    const user = await prisma.user.findUniqueOrThrow({ where: { email } })

    return { cookie, user }
  }

  async function createBattle(
    battleFieldId: string,
    override: Record<string, unknown> = {}
  ) {
    return prisma.battle.create({
      data: {
        mode: 'AUTO',
        status: 'COMPLETED',
        battleFieldId,
        totalTurns: 5,
        ...override,
      },
    })
  }

  async function createBattleTeam(
    battleId: string,
    teamNumber: number,
    userId: string | null
  ) {
    return prisma.battleTeam.create({
      data: { battleId, teamNumber, userId },
    })
  }

  // ── tests ─────────────────────────────────────────────────────────────────

  it('should return 401 when not authenticated', async () => {
    const response = await request(app).get('/battle/history')

    expect(response.status).toBe(401)
    expect(response.body.message).toBeDefined()
  })

  it('should return an empty list when the user has no battles', async () => {
    const { cookie } = await registerAndAuthenticate(
      'no-battles@example.com',
      'No Battles'
    )

    const response = await request(app)
      .get('/battle/history')
      .set('Cookie', cookie)

    expect(response.status).toBe(200)
    expect(response.body.battles).toEqual([])
  })

  it('should list battles the user took part in, most recent first, with outcome and opponent', async () => {
    const battleField = await createBattleField()
    const { cookie: myCookie, user: me } = await registerAndAuthenticate(
      'me@example.com',
      'Me'
    )
    const { user: opponent } = await registerAndAuthenticate(
      'rival@example.com',
      'Rival'
    )

    const olderBattle = await createBattle(battleField.id, {
      winnerTeam: 1,
      createdAt: new Date('2026-01-01'),
    })
    await createBattleTeam(olderBattle.id, 1, me.id)
    await createBattleTeam(olderBattle.id, 2, opponent.id)

    const newerBattle = await createBattle(battleField.id, {
      winnerTeam: 2,
      createdAt: new Date('2026-02-01'),
    })
    await createBattleTeam(newerBattle.id, 1, me.id)
    await createBattleTeam(newerBattle.id, 2, null)

    const response = await request(app)
      .get('/battle/history')
      .set('Cookie', myCookie)

    expect(response.status).toBe(200)
    expect(response.body.battles).toHaveLength(2)

    const [first, second] = response.body.battles

    expect(first).toMatchObject({
      battleId: newerBattle.id,
      myTeamNumber: 1,
      outcome: 'LOSS',
      opponent: { userId: null, name: null },
    })

    expect(second).toMatchObject({
      battleId: olderBattle.id,
      myTeamNumber: 1,
      outcome: 'WIN',
      opponent: { userId: opponent.id, name: 'Rival' },
    })
  })

  it('should mark the outcome as DRAW when the battle has no winner', async () => {
    const battleField = await createBattleField()
    const { cookie } = await registerAndAuthenticate(
      'drawer@example.com',
      'Drawer'
    )
    const me = await prisma.user.findUniqueOrThrow({
      where: { email: 'drawer@example.com' },
    })

    const battle = await createBattle(battleField.id, { winnerTeam: null })
    await createBattleTeam(battle.id, 1, me.id)
    await createBattleTeam(battle.id, 2, null)

    const response = await request(app)
      .get('/battle/history')
      .set('Cookie', cookie)

    expect(response.status).toBe(200)
    expect(response.body.battles[0]).toMatchObject({ outcome: 'DRAW' })
  })

  it('should not return battles the user is not part of', async () => {
    const battleField = await createBattleField()
    const { cookie } = await registerAndAuthenticate(
      'outsider@example.com',
      'Outsider'
    )
    const { user: playerA } = await registerAndAuthenticate(
      'player-a@example.com',
      'Player A'
    )
    const { user: playerB } = await registerAndAuthenticate(
      'player-b@example.com',
      'Player B'
    )

    const battle = await createBattle(battleField.id, { winnerTeam: 1 })
    await createBattleTeam(battle.id, 1, playerA.id)
    await createBattleTeam(battle.id, 2, playerB.id)

    const response = await request(app)
      .get('/battle/history')
      .set('Cookie', cookie)

    expect(response.status).toBe(200)
    expect(response.body.battles).toEqual([])
  })
})
