import { describe, it, expect, afterEach, afterAll } from 'vitest'
import request from 'supertest'
import app from '../../app'
import { prisma } from '../../config/prisma'

describe('POST /powers (CreatePowerController)', () => {
  afterEach(async () => {
    await prisma.power.deleteMany()
    await prisma.user.deleteMany()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  async function createAdminAndGetCookie() {
    await request(app)
      .post('/users')
      .send({ name: 'Admin User', email: 'admin@example.com', password: '123456' })

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
    await request(app)
      .post('/users')
      .send({ name: 'Regular User', email: 'user@example.com', password: '123456' })

    const authResponse = await request(app)
      .post('/users/authenticate')
      .send({ email: 'user@example.com', password: '123456' })

    return authResponse.headers['set-cookie'] as unknown as string[]
  }

  it('should create a power and return 201 when admin is authenticated', async () => {
    const cookie = await createAdminAndGetCookie()

    const response = await request(app)
      .post('/powers')
      .set('Cookie', cookie)
      .send({ name: 'Fire', description: 'Fire-based attacks' })

    expect(response.status).toBe(201)
    expect(response.body).toMatchObject({
      id: expect.any(String),
      name: 'Fire',
      description: 'Fire-based attacks',
      createAt: expect.any(String),
    })
  })

  it('should return 400 when power name already exists', async () => {
    const cookie = await createAdminAndGetCookie()

    await prisma.power.create({ data: { name: 'Fire', description: 'Fire-based attacks' } })

    const response = await request(app)
      .post('/powers')
      .set('Cookie', cookie)
      .send({ name: 'Fire', description: 'Another fire power' })

    expect(response.status).toBe(400)
    expect(response.body.message).toBeDefined()
  })

  it('should return 400 when user is not an admin', async () => {
    const cookie = await createUserAndGetCookie()

    const response = await request(app)
      .post('/powers')
      .set('Cookie', cookie)
      .send({ name: 'Ice', description: 'Ice-based attacks' })

    expect(response.status).toBe(400)
    expect(response.body.message).toBeDefined()
  })

  it('should return 401 when not authenticated', async () => {
    const response = await request(app)
      .post('/powers')
      .send({ name: 'Fire', description: 'Fire-based attacks' })

    expect(response.status).toBe(401)
    expect(response.body.message).toBeDefined()
  })

  it('should return 400 when required fields are missing', async () => {
    const cookie = await createAdminAndGetCookie()

    const response = await request(app)
      .post('/powers')
      .set('Cookie', cookie)
      .send({ name: 'Fire' })

    expect(response.status).toBe(400)
    expect(response.body.errors).toBeDefined()
  })
})
