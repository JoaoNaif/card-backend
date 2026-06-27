import { describe, it, expect, afterEach, afterAll } from 'vitest'
import request from 'supertest'
import app from '../../app'
import { prisma } from '../../config/prisma'

describe('PUT /powers/update (EditPowerController)', () => {
  afterEach(async () => {
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

  async function createPower(name = 'Fire') {
    return prisma.power.create({
      data: {
        name,
        description: 'Fire-based attacks',
        canAwaken: true,
        isAwakened: false,
        pillar: 'BIOLOGICA',
      },
    })
  }

  it('should return 204 when admin updates power name', async () => {
    const cookie = await createAdminAndGetCookie()
    const power = await createPower()

    const response = await request(app)
      .put('/powers/update')
      .set('Cookie', cookie)
      .send({ powerId: power.id, name: 'Flame' })

    expect(response.status).toBe(204)
  })

  it('should return 204 when admin updates power description', async () => {
    const cookie = await createAdminAndGetCookie()
    const power = await createPower()

    const response = await request(app)
      .put('/powers/update')
      .set('Cookie', cookie)
      .send({ powerId: power.id, description: 'Updated description' })

    expect(response.status).toBe(204)
  })

  it('should return 204 when admin updates power pillar', async () => {
    const cookie = await createAdminAndGetCookie()
    const power = await createPower()

    const response = await request(app)
      .put('/powers/update')
      .set('Cookie', cookie)
      .send({ powerId: power.id, pillar: 'PSIQUICA' })

    expect(response.status).toBe(204)
  })

  it('should return 400 when new name is already taken by another power', async () => {
    const cookie = await createAdminAndGetCookie()
    await createPower('Fire')
    const power2 = await createPower('Ice')

    const response = await request(app)
      .put('/powers/update')
      .set('Cookie', cookie)
      .send({ powerId: power2.id, name: 'Fire' })

    expect(response.status).toBe(400)
    expect(response.body.message).toBeDefined()
  })

  it('should return 400 when power does not exist', async () => {
    const cookie = await createAdminAndGetCookie()

    const response = await request(app)
      .put('/powers/update')
      .set('Cookie', cookie)
      .send({ powerId: 'nonexistent-id', name: 'Flame' })

    expect(response.status).toBe(400)
    expect(response.body.message).toBeDefined()
  })

  it('should return 400 when user is not an admin', async () => {
    const cookie = await createUserAndGetCookie()
    const power = await createPower()

    const response = await request(app)
      .put('/powers/update')
      .set('Cookie', cookie)
      .send({ powerId: power.id, name: 'Flame' })

    expect(response.status).toBe(400)
    expect(response.body.message).toBeDefined()
  })

  it('should return 401 when not authenticated', async () => {
    const power = await createPower()

    const response = await request(app)
      .put('/powers/update')
      .send({ powerId: power.id, name: 'Flame' })

    expect(response.status).toBe(401)
  })

  it('should return 400 when powerId is missing', async () => {
    const cookie = await createAdminAndGetCookie()

    const response = await request(app)
      .put('/powers/update')
      .set('Cookie', cookie)
      .send({ name: 'Flame' })

    expect(response.status).toBe(400)
    expect(response.body.errors).toBeDefined()
  })
})
