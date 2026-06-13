import { describe, it, expect, afterEach, afterAll } from 'vitest'
import request from 'supertest'
import app from '../../app'
import { prisma } from '../../config/prisma'

describe('POST /battle-field (CreateBattleFieldController)', () => {
  afterEach(async () => {
    await prisma.battleField.deleteMany()
    await prisma.trait.deleteMany()
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

  async function createTrait() {
    return prisma.trait.create({
      data: { name: 'Nadador', description: 'Habituado às águas' },
    })
  }

  it('should create a battle field and return 201 when admin is authenticated', async () => {
    const cookie = await createAdminAndGetCookie()
    const trait = await createTrait()

    const response = await request(app)
      .post('/battle-field')
      .set('Cookie', cookie)
      .send({
        name: 'Alto Mar',
        description: 'Campo de batalha no alto mar',
        modifiers: [
          { traitId: trait.id, stat: 'ATK', bonusType: 'PERCENT', bonusValue: 10 },
        ],
      })

    expect(response.status).toBe(201)
    expect(response.body).toMatchObject({
      id: expect.any(String),
      name: 'Alto Mar',
      description: 'Campo de batalha no alto mar',
      modifiers: [
        expect.objectContaining({
          traitId: trait.id,
          stat: 'ATK',
          bonusType: 'PERCENT',
          bonusValue: 10,
        }),
      ],
      createdAt: expect.any(String),
    })
  })

  it('should create a battle field with no modifiers when modifiers is omitted', async () => {
    const cookie = await createAdminAndGetCookie()

    const response = await request(app)
      .post('/battle-field')
      .set('Cookie', cookie)
      .send({
        name: 'Deserto',
        description: 'Campo árido sem vantagens',
      })

    expect(response.status).toBe(201)
    expect(response.body.modifiers).toEqual([])
  })

  it('should return 400 when battle field name already exists', async () => {
    const cookie = await createAdminAndGetCookie()

    await request(app).post('/battle-field').set('Cookie', cookie).send({
      name: 'Alto Mar',
      description: 'Primeiro campo',
    })

    const response = await request(app)
      .post('/battle-field')
      .set('Cookie', cookie)
      .send({
        name: 'Alto Mar',
        description: 'Segundo campo com mesmo nome',
      })

    expect(response.status).toBe(400)
    expect(response.body.message).toBeDefined()
  })

  it('should return 400 when trait does not exist', async () => {
    const cookie = await createAdminAndGetCookie()

    const response = await request(app)
      .post('/battle-field')
      .set('Cookie', cookie)
      .send({
        name: 'Floresta',
        description: 'Campo na floresta',
        modifiers: [
          { traitId: 'non-existent-id', stat: 'DEF', bonusType: 'FLAT', bonusValue: 5 },
        ],
      })

    expect(response.status).toBe(400)
    expect(response.body.message).toBeDefined()
  })

  it('should return 400 when user is not an admin', async () => {
    const cookie = await createUserAndGetCookie()

    const response = await request(app)
      .post('/battle-field')
      .set('Cookie', cookie)
      .send({
        name: 'Alto Mar',
        description: 'Campo de batalha no alto mar',
      })

    expect(response.status).toBe(400)
    expect(response.body.message).toBeDefined()
  })

  it('should return 401 when not authenticated', async () => {
    const response = await request(app).post('/battle-field').send({
      name: 'Alto Mar',
      description: 'Campo de batalha no alto mar',
    })

    expect(response.status).toBe(401)
    expect(response.body.message).toBeDefined()
  })

  it('should return 400 when required fields are missing', async () => {
    const cookie = await createAdminAndGetCookie()

    const response = await request(app)
      .post('/battle-field')
      .set('Cookie', cookie)
      .send({ name: 'Alto Mar' })

    expect(response.status).toBe(400)
    expect(response.body.errors).toBeDefined()
  })

  it('should return 400 when modifier has invalid stat value', async () => {
    const cookie = await createAdminAndGetCookie()
    const trait = await createTrait()

    const response = await request(app)
      .post('/battle-field')
      .set('Cookie', cookie)
      .send({
        name: 'Vulcão',
        description: 'Campo vulcânico',
        modifiers: [
          { traitId: trait.id, stat: 'INVALID_STAT', bonusType: 'PERCENT', bonusValue: 5 },
        ],
      })

    expect(response.status).toBe(400)
    expect(response.body.errors).toBeDefined()
  })

  it('should return 400 when modifier has invalid bonusType value', async () => {
    const cookie = await createAdminAndGetCookie()
    const trait = await createTrait()

    const response = await request(app)
      .post('/battle-field')
      .set('Cookie', cookie)
      .send({
        name: 'Vulcão',
        description: 'Campo vulcânico',
        modifiers: [
          { traitId: trait.id, stat: 'HP', bonusType: 'INVALID_BONUS', bonusValue: 5 },
        ],
      })

    expect(response.status).toBe(400)
    expect(response.body.errors).toBeDefined()
  })
})
