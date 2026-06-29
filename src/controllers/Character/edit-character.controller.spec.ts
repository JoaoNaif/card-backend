import { describe, it, expect, afterEach, afterAll } from 'vitest'
import request from 'supertest'
import app from '../../app'
import { prisma } from '../../config/prisma'
import { Ranking } from '../../entities/character'

describe('PUT /characters/update (EditCharacterController)', () => {
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

  async function createCharacter(name = 'Kai') {
    const power = await prisma.power.create({
      data: { name: 'Fire', description: 'Fire-based power', pillar: 'MATERIAL' },
    })

    return prisma.character.create({
      data: {
        name,
        description: 'A powerful warrior',
        maxRanking: Ranking.CAOTICO,
        baseHp: 100,
        baseAtk: 50,
        baseDef: 30,
        baseSpd: 20,
        powerId: power.id,
      },
    })
  }

  it('should return 204 when admin updates character name', async () => {
    const cookie = await createAdminAndGetCookie()
    const character = await createCharacter()

    const response = await request(app)
      .put('/characters/update')
      .set('Cookie', cookie)
      .send({ characterId: character.id, name: 'Zara' })

    expect(response.status).toBe(204)

    const updated = await prisma.character.findUnique({ where: { id: character.id } })
    expect(updated?.name).toBe('Zara')
  })

  it('should return 204 when admin updates character description', async () => {
    const cookie = await createAdminAndGetCookie()
    const character = await createCharacter()

    const response = await request(app)
      .put('/characters/update')
      .set('Cookie', cookie)
      .send({ characterId: character.id, description: 'Updated description' })

    expect(response.status).toBe(204)

    const updated = await prisma.character.findUnique({ where: { id: character.id } })
    expect(updated?.description).toBe('Updated description')
  })

  it('should return 204 when admin updates both name and description', async () => {
    const cookie = await createAdminAndGetCookie()
    const character = await createCharacter()

    const response = await request(app)
      .put('/characters/update')
      .set('Cookie', cookie)
      .send({ characterId: character.id, name: 'Zara', description: 'New desc' })

    expect(response.status).toBe(204)
  })

  it('should return 400 when new name is already taken', async () => {
    const cookie = await createAdminAndGetCookie()
    const power = await prisma.power.create({
      data: { name: 'Ice', description: 'Ice-based power', pillar: 'MATERIAL' },
    })
    await prisma.character.create({
      data: {
        name: 'Zara',
        description: 'Already taken',
        maxRanking: Ranking.CAOTICO,
        baseHp: 100,
        baseAtk: 50,
        baseDef: 30,
        baseSpd: 20,
        powerId: power.id,
      },
    })
    const character = await createCharacter('Kai')

    const response = await request(app)
      .put('/characters/update')
      .set('Cookie', cookie)
      .send({ characterId: character.id, name: 'Zara' })

    expect(response.status).toBe(400)
    expect(response.body.message).toBeDefined()
  })

  it('should return 400 when character does not exist', async () => {
    const cookie = await createAdminAndGetCookie()

    const response = await request(app)
      .put('/characters/update')
      .set('Cookie', cookie)
      .send({ characterId: 'nonexistent-id', name: 'Zara' })

    expect(response.status).toBe(400)
    expect(response.body.message).toBeDefined()
  })

  it('should return 400 when user is not an admin', async () => {
    const cookie = await createUserAndGetCookie()
    const character = await createCharacter()

    const response = await request(app)
      .put('/characters/update')
      .set('Cookie', cookie)
      .send({ characterId: character.id, name: 'Zara' })

    expect(response.status).toBe(400)
    expect(response.body.message).toBeDefined()
  })

  it('should return 400 when characterId is missing', async () => {
    const cookie = await createAdminAndGetCookie()

    const response = await request(app)
      .put('/characters/update')
      .set('Cookie', cookie)
      .send({ name: 'Zara' })

    expect(response.status).toBe(400)
    expect(response.body.errors).toBeDefined()
  })

  it('should return 401 when not authenticated', async () => {
    const character = await createCharacter()

    const response = await request(app)
      .put('/characters/update')
      .send({ characterId: character.id, name: 'Zara' })

    expect(response.status).toBe(401)
  })
})
