import { describe, it, expect, afterEach, afterAll } from 'vitest'
import request from 'supertest'
import app from '../../app'
import { prisma } from '../../config/prisma'
import { Ranking } from '../../entities/character'

describe('PATCH /characters/swap (SwapCharacterController)', () => {
  afterEach(async () => {
    await prisma.character.deleteMany()
    await prisma.power.deleteMany()
    await prisma.user.deleteMany()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  async function createUserAndGetCookie(
    email = 'user@example.com',
    password = '123456'
  ) {
    await request(app).post('/users').send({
      name: 'Regular User',
      email,
      password,
    })

    const authResponse = await request(app)
      .post('/users/authenticate')
      .send({ email, password })

    return authResponse.headers['set-cookie'] as unknown as string[]
  }

  async function createPower() {
    return prisma.power.create({
      data: { name: 'Fire', description: 'Fire-based power' },
    })
  }

  let charCounter = 0

  async function createCharacter(powerId: string, userId?: string) {
    return prisma.character.create({
      data: {
        name: `Character-${++charCounter}`,
        description: 'A powerful warrior',
        maxRanking: Ranking.ANCESTRAL,
        baseHp: 100,
        baseAtk: 50,
        baseDef: 30,
        baseSpd: 20,
        powerId,
        userId: userId ?? null,
      },
    })
  }

  it('should swap characters and return 201 when authenticated', async () => {
    const cookie = await createUserAndGetCookie()
    const user = await prisma.user.findUnique({
      where: { email: 'user@example.com' },
    })

    const power = await createPower()
    const removeCharacter = await createCharacter(power.id, user!.id)
    const newCharacter = await createCharacter(power.id)

    const response = await request(app)
      .patch('/characters/swap')
      .set('Cookie', cookie)
      .send({
        removeCharacterId: removeCharacter.id,
        newCharacterId: newCharacter.id,
      })

    expect(response.status).toBe(201)

    const released = await prisma.character.findUnique({
      where: { id: removeCharacter.id },
    })
    const acquired = await prisma.character.findUnique({
      where: { id: newCharacter.id },
    })

    expect(released?.userId).toBeNull()
    expect(acquired?.userId).toBe(user!.id)
  })

  it('should return 400 when removeCharacter does not belong to the user', async () => {
    const cookie = await createUserAndGetCookie()

    const power = await createPower()
    const someOtherUser = await prisma.user.create({
      data: { name: 'Other', email: 'other@example.com', passwordHash: 'x' },
    })
    const removeCharacter = await createCharacter(power.id, someOtherUser.id)
    const newCharacter = await createCharacter(power.id)

    const response = await request(app)
      .patch('/characters/swap')
      .set('Cookie', cookie)
      .send({
        removeCharacterId: removeCharacter.id,
        newCharacterId: newCharacter.id,
      })

    expect(response.status).toBe(400)
    expect(response.body.message).toBeDefined()
  })

  it('should return 400 when removeCharacter does not exist', async () => {
    const cookie = await createUserAndGetCookie()
    const power = await createPower()
    const newCharacter = await createCharacter(power.id)

    const response = await request(app)
      .patch('/characters/swap')
      .set('Cookie', cookie)
      .send({
        removeCharacterId: 'non-existent-id',
        newCharacterId: newCharacter.id,
      })

    expect(response.status).toBe(400)
    expect(response.body.message).toBeDefined()
  })

  it('should return 400 when newCharacter does not exist', async () => {
    const cookie = await createUserAndGetCookie()
    const user = await prisma.user.findUnique({
      where: { email: 'user@example.com' },
    })

    const power = await createPower()
    const removeCharacter = await createCharacter(power.id, user!.id)

    const response = await request(app)
      .patch('/characters/swap')
      .set('Cookie', cookie)
      .send({
        removeCharacterId: removeCharacter.id,
        newCharacterId: 'non-existent-id',
      })

    expect(response.status).toBe(400)
    expect(response.body.message).toBeDefined()
  })

  it('should return 400 when body fields are missing', async () => {
    const cookie = await createUserAndGetCookie()

    const response = await request(app)
      .patch('/characters/swap')
      .set('Cookie', cookie)
      .send({})

    expect(response.status).toBe(400)
    expect(response.body.errors).toBeDefined()
  })

  it('should return 401 when not authenticated', async () => {
    const power = await createPower()
    const removeCharacter = await createCharacter(power.id)
    const newCharacter = await createCharacter(power.id)

    const response = await request(app)
      .patch('/characters/swap')
      .send({
        removeCharacterId: removeCharacter.id,
        newCharacterId: newCharacter.id,
      })

    expect(response.status).toBe(401)
    expect(response.body.message).toBeDefined()
  })
})
