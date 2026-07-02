import { describe, it, expect, afterEach, afterAll } from 'vitest'
import request from 'supertest'
import app from '../../app'
import { prisma } from '../../config/prisma'

describe('DELETE /battle-field/remove (RemoveBattleFieldController)', () => {
  afterEach(async () => {
    await prisma.battleField.deleteMany()
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

  async function createBattleField(name = 'Alto Mar') {
    return prisma.battleField.create({
      data: { name, description: 'Campo de batalha no alto mar' },
    })
  }

  it('should return 204 and delete the battle field when admin is authenticated', async () => {
    const cookie = await createAdminAndGetCookie()
    const battleField = await createBattleField()

    const response = await request(app)
      .delete('/battle-field/remove')
      .set('Cookie', cookie)
      .send({ battleFieldId: battleField.id })

    expect(response.status).toBe(204)

    const deleted = await prisma.battleField.findUnique({
      where: { id: battleField.id },
    })
    expect(deleted).toBeNull()
  })

  it('should return 400 when battle field does not exist', async () => {
    const cookie = await createAdminAndGetCookie()

    const response = await request(app)
      .delete('/battle-field/remove')
      .set('Cookie', cookie)
      .send({ battleFieldId: 'nonexistent-id' })

    expect(response.status).toBe(400)
    expect(response.body.message).toBeDefined()
  })

  it('should return 400 when user is not an admin', async () => {
    const cookie = await createUserAndGetCookie()
    const battleField = await createBattleField()

    const response = await request(app)
      .delete('/battle-field/remove')
      .set('Cookie', cookie)
      .send({ battleFieldId: battleField.id })

    expect(response.status).toBe(400)
    expect(response.body.message).toBeDefined()
  })

  it('should return 400 when battleFieldId is missing', async () => {
    const cookie = await createAdminAndGetCookie()

    const response = await request(app)
      .delete('/battle-field/remove')
      .set('Cookie', cookie)
      .send({})

    expect(response.status).toBe(400)
    expect(response.body.errors).toBeDefined()
  })

  it('should return 401 when not authenticated', async () => {
    const battleField = await createBattleField()

    const response = await request(app)
      .delete('/battle-field/remove')
      .send({ battleFieldId: battleField.id })

    expect(response.status).toBe(401)
  })
})
