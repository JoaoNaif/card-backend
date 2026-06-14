import { describe, it, expect, afterEach, afterAll } from 'vitest'
import request from 'supertest'
import app from '../../app'
import { prisma } from '../../config/prisma'
import { Ranking } from '../../entities/character'

describe('POST /characters (CreateCharacterController)', () => {
  afterEach(async () => {
    await prisma.character.deleteMany()
    await prisma.power.deleteMany()
    await prisma.user.deleteMany()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  async function createAdminAndGetCookie() {
    await request(app).post('/users').send({
      name: 'Admin User',
      email: 'admin@example.com',
      password: '123456',
    })

    await prisma.user.update({
      where: { email: 'admin@example.com' },
      data: { userRole: 'ADMIN' },
    })

    const authResponse = await request(app)
      .post('/users/authenticate')
      .send({ email: 'admin@example.com', password: '123456' })

    return authResponse.headers['set-cookie'] as unknown as string[]
  }

  async function createUserAndGetCookie() {
    await request(app).post('/users').send({
      name: 'Regular User',
      email: 'user@example.com',
      password: '123456',
    })

    const authResponse = await request(app)
      .post('/users/authenticate')
      .send({ email: 'user@example.com', password: '123456' })

    return authResponse.headers['set-cookie'] as unknown as string[]
  }

  async function createPower() {
    return prisma.power.create({
      data: { name: 'Fire', description: 'Fire-based power' },
    })
  }

  function validBody(powerId: string) {
    return {
      name: 'Kai',
      description: 'A powerful warrior',
      ranking: Ranking.DISCRETO,
      maxRanking: Ranking.CAOTICO,
      level: 1,
      xp: 0,
      breakthroughAttempts: 0,
      baseHp: 100,
      baseAtk: 50,
      baseDef: 30,
      baseSpd: 20,
      powerId,
    }
  }

  it('should create a character and return 201 when admin is authenticated', async () => {
    const cookie = await createAdminAndGetCookie()
    const power = await createPower()

    const response = await request(app)
      .post('/characters')
      .set('Cookie', cookie)
      .send(validBody(power.id))

    expect(response.status).toBe(201)
    expect(response.body).toMatchObject({
      id: expect.any(String),
      name: 'Kai',
      description: 'A powerful warrior',
      ranking: Ranking.DISCRETO,
      maxRanking: Ranking.CAOTICO,
      level: 1,
      xp: 0,
      baseHp: 100,
      baseAtk: 50,
      baseDef: 30,
      baseSpd: 20,
      powerId: power.id,
      createdAt: expect.any(String),
    })
  })

  it('should return 400 when character name already exists', async () => {
    const cookie = await createAdminAndGetCookie()
    const power = await createPower()

    await request(app)
      .post('/characters')
      .set('Cookie', cookie)
      .send(validBody(power.id))

    const response = await request(app)
      .post('/characters')
      .set('Cookie', cookie)
      .send(validBody(power.id))

    expect(response.status).toBe(400)
    expect(response.body.message).toBeDefined()
  })

  it('should return 400 when power does not exist', async () => {
    const cookie = await createAdminAndGetCookie()

    const response = await request(app)
      .post('/characters')
      .set('Cookie', cookie)
      .send(validBody('non-existent-power-id'))

    expect(response.status).toBe(400)
    expect(response.body.message).toBeDefined()
  })

  it('should return 400 when user is not an admin', async () => {
    const cookie = await createUserAndGetCookie()
    const power = await createPower()

    const response = await request(app)
      .post('/characters')
      .set('Cookie', cookie)
      .send(validBody(power.id))

    expect(response.status).toBe(400)
    expect(response.body.message).toBeDefined()
  })

  it('should return 401 when not authenticated', async () => {
    const power = await createPower()

    const response = await request(app)
      .post('/characters')
      .send(validBody(power.id))

    expect(response.status).toBe(401)
    expect(response.body.message).toBeDefined()
  })

  it('should return 400 when required fields are missing', async () => {
    const cookie = await createAdminAndGetCookie()

    const response = await request(app)
      .post('/characters')
      .set('Cookie', cookie)
      .send({ name: 'Kai' })

    expect(response.status).toBe(400)
    expect(response.body.errors).toBeDefined()
  })

  it('should return 400 when ranking has an invalid value', async () => {
    const cookie = await createAdminAndGetCookie()
    const power = await createPower()

    const response = await request(app)
      .post('/characters')
      .set('Cookie', cookie)
      .send({ ...validBody(power.id), ranking: 'INVALID_RANKING' })

    expect(response.status).toBe(400)
    expect(response.body.errors).toBeDefined()
  })
})
