import { describe, it, expect, afterEach, afterAll } from 'vitest'
import request from 'supertest'
import app from '../../app'
import { prisma } from '../../config/prisma'
import { Ranking } from '../../entities/character'

describe('PATCH /characters/acquire (AcquireCharacterController)', () => {
  afterEach(async () => {
    await prisma.character.deleteMany()
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

  async function createCharacter() {
    const power = await prisma.power.create({
      data: { name: 'Fire', description: 'Fire-based power' },
    })

    return prisma.character.create({
      data: {
        name: 'Kai',
        description: 'A powerful warrior',
        maxRanking: Ranking.ANCESTRAL,
        baseHp: 100,
        baseAtk: 50,
        baseDef: 30,
        baseSpd: 20,
        powerId: power.id,
      },
    })
  }

  it('should acquire a character and return 201 when authenticated', async () => {
    const cookie = await createUserAndGetCookie()
    const character = await createCharacter()

    const response = await request(app)
      .patch('/characters/acquire')
      .set('Cookie', cookie)
      .send({ characterId: character.id })

    expect(response.status).toBe(201)

    const updated = await prisma.character.findUnique({ where: { id: character.id } })
    expect(updated?.userId).toBeDefined()
  })

  it('should return 400 when character does not exist', async () => {
    const cookie = await createUserAndGetCookie()

    const response = await request(app)
      .patch('/characters/acquire')
      .set('Cookie', cookie)
      .send({ characterId: 'non-existent-id' })

    expect(response.status).toBe(400)
    expect(response.body.message).toBeDefined()
  })

  it('should return 400 when characterId is missing from body', async () => {
    const cookie = await createUserAndGetCookie()

    const response = await request(app)
      .patch('/characters/acquire')
      .set('Cookie', cookie)
      .send({})

    expect(response.status).toBe(400)
    expect(response.body.errors).toBeDefined()
  })

  it('should return 400 when roster is full (8 characters)', async () => {
    const cookie = await createUserAndGetCookie()

    const user = await prisma.user.findUnique({
      where: { email: 'user@example.com' },
    })

    const power = await prisma.power.create({
      data: { name: 'Fire', description: 'Fire-based power' },
    })

    await Promise.all(
      Array.from({ length: 8 }).map((_, i) =>
        prisma.character.create({
          data: {
            name: `Character ${i}`,
            description: 'A warrior',
            maxRanking: Ranking.ANCESTRAL,
            baseHp: 100,
            baseAtk: 50,
            baseDef: 30,
            baseSpd: 20,
            powerId: power.id,
            userId: user!.id,
          },
        })
      )
    )

    const extraCharacter = await prisma.character.create({
      data: {
        name: 'Extra',
        description: 'One too many',
        maxRanking: Ranking.ANCESTRAL,
        baseHp: 100,
        baseAtk: 50,
        baseDef: 30,
        baseSpd: 20,
        powerId: power.id,
      },
    })

    const response = await request(app)
      .patch('/characters/acquire')
      .set('Cookie', cookie)
      .send({ characterId: extraCharacter.id })

    expect(response.status).toBe(400)
    expect(response.body.message).toBeDefined()
  })

  it('should return 401 when not authenticated', async () => {
    const character = await createCharacter()

    const response = await request(app)
      .patch('/characters/acquire')
      .send({ characterId: character.id })

    expect(response.status).toBe(401)
    expect(response.body.message).toBeDefined()
  })
})
