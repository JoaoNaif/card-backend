import { describe, it, expect, afterEach, afterAll } from 'vitest'
import request from 'supertest'
import app from '../../app'
import { prisma } from '../../config/prisma'
import { Ranking } from '../../entities/character'

describe('PATCH /characters/assign-trait (AssignTraitController)', () => {
  afterEach(async () => {
    await prisma.character.deleteMany()
    await prisma.trait.deleteMany()
    await prisma.power.deleteMany()
    await prisma.user.deleteMany()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

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

  async function createCharacterOwnedByUser(userId: string) {
    const power = await prisma.power.create({
      data: { name: 'Fire', description: 'Fire-based power' },
    })

    return prisma.character.create({
      data: {
        name: 'Test Hero',
        description: 'A test character',
        maxRanking: Ranking.CAOTICO,
        baseHp: 100,
        baseAtk: 50,
        baseDef: 30,
        baseSpd: 20,
        powerId: power.id,
        userId,
      },
    })
  }

  async function createTrait() {
    return prisma.trait.create({
      data: { name: 'Voador', description: 'Pode voar' },
    })
  }

  it('should assign a trait and return 201', async () => {
    const cookie = await createUserAndGetCookie()
    const user = await prisma.user.findUnique({ where: { email: 'user@example.com' } })
    const character = await createCharacterOwnedByUser(user!.id)
    const trait = await createTrait()

    const response = await request(app)
      .patch('/characters/assign-trait')
      .set('Cookie', cookie)
      .send({ characterId: character.id, traitId: trait.id })

    expect(response.status).toBe(201)

    const updated = await prisma.character.findUnique({
      where: { id: character.id },
      include: { traits: true },
    })
    expect(updated?.traits.some((t) => t.id === trait.id)).toBe(true)
  })

  it('should return 400 when character does not exist', async () => {
    const cookie = await createUserAndGetCookie()
    const trait = await createTrait()

    const response = await request(app)
      .patch('/characters/assign-trait')
      .set('Cookie', cookie)
      .send({ characterId: 'non-existent-id', traitId: trait.id })

    expect(response.status).toBe(400)
    expect(response.body.message).toBeDefined()
  })

  it('should return 400 when trait does not exist', async () => {
    const cookie = await createUserAndGetCookie()
    const user = await prisma.user.findUnique({ where: { email: 'user@example.com' } })
    const character = await createCharacterOwnedByUser(user!.id)

    const response = await request(app)
      .patch('/characters/assign-trait')
      .set('Cookie', cookie)
      .send({ characterId: character.id, traitId: 'non-existent-trait' })

    expect(response.status).toBe(400)
    expect(response.body.message).toBeDefined()
  })

  it('should return 400 when character does not belong to user', async () => {
    const cookie = await createUserAndGetCookie()
    const trait = await createTrait()

    const otherUser = await prisma.user.create({
      data: { name: 'Other', email: 'other@example.com', passwordHash: 'x' },
    })
    const character = await createCharacterOwnedByUser(otherUser.id)

    const response = await request(app)
      .patch('/characters/assign-trait')
      .set('Cookie', cookie)
      .send({ characterId: character.id, traitId: trait.id })

    expect(response.status).toBe(400)
    expect(response.body.message).toBeDefined()
  })

  it('should return 400 when body fields are missing', async () => {
    const cookie = await createUserAndGetCookie()

    const response = await request(app)
      .patch('/characters/assign-trait')
      .set('Cookie', cookie)
      .send({})

    expect(response.status).toBe(400)
    expect(response.body.errors).toBeDefined()
  })

  it('should return 401 when not authenticated', async () => {
    const response = await request(app)
      .patch('/characters/assign-trait')
      .send({ characterId: 'any', traitId: 'any' })

    expect(response.status).toBe(401)
    expect(response.body.message).toBeDefined()
  })
})
