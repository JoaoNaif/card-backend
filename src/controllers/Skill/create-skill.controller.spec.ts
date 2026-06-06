import { describe, it, expect, afterEach, afterAll } from 'vitest'
import request from 'supertest'
import app from '../../app'
import { prisma } from '../../config/prisma'

describe('POST /skills (CreateSkillController)', () => {
  afterEach(async () => {
    await prisma.skill.deleteMany()
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

  it('should create a skill and return 201 when admin is authenticated', async () => {
    const cookie = await createAdminAndGetCookie()
    const power = await createPower()

    const response = await request(app)
      .post('/skills')
      .set('Cookie', cookie)
      .send({
        name: 'Fireball',
        description: 'Launches a fireball',
        limitation: 'Once per turn',
        cost: 3,
        minLevel: 5,
        powerId: power.id,
      })

    expect(response.status).toBe(201)
    expect(response.body).toMatchObject({
      id: expect.any(String),
      name: 'Fireball',
      description: 'Launches a fireball',
      limitation: 'Once per turn',
      cost: 3,
      minLevel: 5,
      powerId: power.id,
      createdAt: expect.any(String),
    })
  })

  it('should return 400 when skill name already exists', async () => {
    const cookie = await createAdminAndGetCookie()
    const power = await createPower()

    await request(app)
      .post('/skills')
      .set('Cookie', cookie)
      .send({
        name: 'Fireball',
        description: 'Launches a fireball',
        limitation: 'Once per turn',
        cost: 3,
        minLevel: 5,
        powerId: power.id,
      })

    const response = await request(app)
      .post('/skills')
      .set('Cookie', cookie)
      .send({
        name: 'Fireball',
        description: 'Another fireball',
        limitation: 'Once per turn',
        cost: 2,
        minLevel: 1,
        powerId: power.id,
      })

    expect(response.status).toBe(400)
    expect(response.body.message).toBeDefined()
  })

  it('should return 400 when power does not exist', async () => {
    const cookie = await createAdminAndGetCookie()

    const response = await request(app)
      .post('/skills')
      .set('Cookie', cookie)
      .send({
        name: 'Fireball',
        description: 'Launches a fireball',
        limitation: 'Once per turn',
        cost: 3,
        minLevel: 5,
        powerId: 'non-existent-id',
      })

    expect(response.status).toBe(400)
    expect(response.body.message).toBeDefined()
  })

  it('should return 400 when user is not an admin', async () => {
    const cookie = await createUserAndGetCookie()
    const power = await createPower()

    const response = await request(app)
      .post('/skills')
      .set('Cookie', cookie)
      .send({
        name: 'Fireball',
        description: 'Launches a fireball',
        limitation: 'Once per turn',
        cost: 3,
        minLevel: 5,
        powerId: power.id,
      })

    expect(response.status).toBe(400)
    expect(response.body.message).toBeDefined()
  })

  it('should return 401 when not authenticated', async () => {
    const power = await createPower()

    const response = await request(app)
      .post('/skills')
      .send({
        name: 'Fireball',
        description: 'Launches a fireball',
        limitation: 'Once per turn',
        cost: 3,
        minLevel: 5,
        powerId: power.id,
      })

    expect(response.status).toBe(401)
    expect(response.body.message).toBeDefined()
  })

  it('should return 400 when required fields are missing', async () => {
    const cookie = await createAdminAndGetCookie()
    const power = await createPower()

    const response = await request(app)
      .post('/skills')
      .set('Cookie', cookie)
      .send({
        name: 'Fireball',
        powerId: power.id,
      })

    expect(response.status).toBe(400)
    expect(response.body.errors).toBeDefined()
  })
})
