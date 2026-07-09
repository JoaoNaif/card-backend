import { describe, it, expect, afterEach, afterAll } from 'vitest'
import request from 'supertest'
import app from '../../app'
import { prisma } from '../../config/prisma'
import { Ranking } from '../../entities/character'

describe('GET /characters/roster-user (FetchCharacterRosterUserController)', () => {
  afterEach(async () => {
    await prisma.character.deleteMany()
    await prisma.power.deleteMany()
    await prisma.user.deleteMany()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  async function createUserAndGetCookie(email = 'user@example.com') {
    await request(app).post('/users').send({
      name: 'Regular User',
      email,
      password: '123456',
    })

    const authResponse = await request(app)
      .post('/users/authenticate')
      .send({ email, password: '123456' })

    return authResponse.headers['set-cookie'] as unknown as string[]
  }

  async function createPower(name = 'Fire') {
    return prisma.power.create({
      data: { name, description: 'Fire-based power', pillar: 'MATERIAL' },
    })
  }

  it('should return 200 with an empty list when user has no characters', async () => {
    const cookie = await createUserAndGetCookie()

    const response = await request(app)
      .get('/characters/roster-user')
      .set('Cookie', cookie)

    expect(response.status).toBe(200)
    expect(response.body).toEqual([])
  })

  it('should return 200 with the characters belonging to the authenticated user', async () => {
    const cookie = await createUserAndGetCookie()
    const power = await createPower()

    const user = await prisma.user.findUnique({ where: { email: 'user@example.com' } })

    await prisma.character.createMany({
      data: [
        {
          name: 'Kai',
          description: 'Warrior',
          maxRanking: Ranking.CAOTICO,
          baseHp: 100,
          baseAtk: 50,
          baseDef: 30,
          baseSpd: 20,
          powerId: power.id,
          userId: user!.id,
        },
        {
          name: 'Zara',
          description: 'Mage',
          maxRanking: Ranking.SINGULAR,
          baseHp: 80,
          baseAtk: 70,
          baseDef: 20,
          baseSpd: 30,
          powerId: power.id,
          userId: user!.id,
        },
      ],
    })

    const response = await request(app)
      .get('/characters/roster-user')
      .set('Cookie', cookie)

    expect(response.status).toBe(200)
    expect(response.body).toHaveLength(2)
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Kai' }),
        expect.objectContaining({ name: 'Zara' }),
      ])
    )
  })

  it('should not return characters belonging to other users', async () => {
    const cookie = await createUserAndGetCookie('user1@example.com')
    await createUserAndGetCookie('user2@example.com')

    const power = await createPower()

    const user1 = await prisma.user.findUnique({ where: { email: 'user1@example.com' } })
    const user2 = await prisma.user.findUnique({ where: { email: 'user2@example.com' } })

    await prisma.character.create({
      data: {
        name: 'Kai',
        description: 'Warrior',
        maxRanking: Ranking.CAOTICO,
        baseHp: 100,
        baseAtk: 50,
        baseDef: 30,
        baseSpd: 20,
        powerId: power.id,
        userId: user1!.id,
      },
    })

    await prisma.character.create({
      data: {
        name: 'Zara',
        description: 'Mage',
        maxRanking: Ranking.SINGULAR,
        baseHp: 80,
        baseAtk: 70,
        baseDef: 20,
        baseSpd: 30,
        powerId: power.id,
        userId: user2!.id,
      },
    })

    const response = await request(app)
      .get('/characters/roster-user')
      .set('Cookie', cookie)

    expect(response.status).toBe(200)
    expect(response.body).toHaveLength(1)
    expect(response.body[0]).toMatchObject({ name: 'Kai' })
  })

  it('each character should have the expected fields', async () => {
    const cookie = await createUserAndGetCookie()
    const power = await createPower()

    const user = await prisma.user.findUnique({ where: { email: 'user@example.com' } })

    await prisma.character.create({
      data: {
        name: 'Kai',
        description: 'Warrior',
        maxRanking: Ranking.CAOTICO,
        baseHp: 100,
        baseAtk: 50,
        baseDef: 30,
        baseSpd: 20,
        powerId: power.id,
        userId: user!.id,
      },
    })

    const response = await request(app)
      .get('/characters/roster-user')
      .set('Cookie', cookie)

    expect(response.status).toBe(200)
    expect(response.body[0]).toMatchObject({
      id: expect.any(String),
      name: 'Kai',
      description: 'Warrior',
      ranking: Ranking.DISCRETO,
      level: 1,
      xp: 0,
      baseHp: 100,
      baseAtk: 50,
      baseDef: 30,
      baseSpd: 20,
      power: {
        id: power.id,
        name: power.name,
        description: power.description,
        pillar: power.pillar,
        canAwaken: power.canAwaken,
        isAwakened: power.isAwakened,
        createdAt: expect.any(String),
      },
      userId: user!.id,
      createdAt: expect.any(String),
    })
  })

  it('should return 401 when not authenticated', async () => {
    const response = await request(app).get('/characters/roster-user')

    expect(response.status).toBe(401)
  })
})
