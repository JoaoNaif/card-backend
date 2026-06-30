import { describe, it, expect, afterEach, afterAll } from 'vitest'
import request from 'supertest'
import app from '../../app'
import { prisma } from '../../config/prisma'
import { Ranking } from '../../entities/character'

describe('DELETE /characters/remove (RemoveCharacterController)', () => {
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

  it('should return 204 and delete the character when admin removes it', async () => {
    const cookie = await createAdminAndGetCookie()
    const character = await createCharacter()

    const response = await request(app)
      .delete('/characters/remove')
      .set('Cookie', cookie)
      .send({ characterId: character.id })

    expect(response.status).toBe(204)

    const deleted = await prisma.character.findUnique({ where: { id: character.id } })
    expect(deleted).toBeNull()
  })

  it('should return 400 when character does not exist', async () => {
    const cookie = await createAdminAndGetCookie()

    const response = await request(app)
      .delete('/characters/remove')
      .set('Cookie', cookie)
      .send({ characterId: 'nonexistent-id' })

    expect(response.status).toBe(400)
    expect(response.body.message).toBeDefined()
  })

  it('should return 400 when user is not an admin', async () => {
    const cookie = await createUserAndGetCookie()
    const character = await createCharacter()

    const response = await request(app)
      .delete('/characters/remove')
      .set('Cookie', cookie)
      .send({ characterId: character.id })

    expect(response.status).toBe(400)
    expect(response.body.message).toBeDefined()
  })

  it('should return 400 when characterId is missing', async () => {
    const cookie = await createAdminAndGetCookie()

    const response = await request(app)
      .delete('/characters/remove')
      .set('Cookie', cookie)
      .send({})

    expect(response.status).toBe(400)
    expect(response.body.errors).toBeDefined()
  })

  it('should return 401 when not authenticated', async () => {
    const character = await createCharacter()

    const response = await request(app)
      .delete('/characters/remove')
      .send({ characterId: character.id })

    expect(response.status).toBe(401)
  })
})
