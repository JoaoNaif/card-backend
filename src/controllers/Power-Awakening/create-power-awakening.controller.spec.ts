import { describe, it, expect, afterEach, afterAll } from 'vitest'
import request from 'supertest'
import app from '../../app'
import { prisma } from '../../config/prisma'

describe('POST /power-awakening (PowerAwakeningController)', () => {
  afterEach(async () => {
    await prisma.powerAwakening.deleteMany()
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

  async function createBasePower() {
    return prisma.power.create({
      data: { name: 'Fire', description: 'Fire-based power', pillar: 'MATERIAL', canAwaken: true },
    })
  }

  async function createAwakenedPower() {
    return prisma.power.create({
      data: { name: 'Magma', description: 'Magma-based power', pillar: 'MATERIAL', isAwakened: true },
    })
  }

  it('should create a power awakening and return 201 when admin is authenticated', async () => {
    const cookie = await createAdminAndGetCookie()
    const basePower = await createBasePower()
    const awakenedPower = await createAwakenedPower()

    const response = await request(app)
      .post('/power-awakening')
      .set('Cookie', cookie)
      .send({ basePowerId: basePower.id, awakenedPowerId: awakenedPower.id })

    expect(response.status).toBe(201)
    expect(response.body).toMatchObject({
      id: expect.any(String),
      basePowerId: basePower.id,
      awakenedPowerId: awakenedPower.id,
    })
  })

  it('should return 401 when user is not an admin', async () => {
    const cookie = await createUserAndGetCookie()
    const basePower = await createBasePower()
    const awakenedPower = await createAwakenedPower()

    const response = await request(app)
      .post('/power-awakening')
      .set('Cookie', cookie)
      .send({ basePowerId: basePower.id, awakenedPowerId: awakenedPower.id })

    expect(response.status).toBe(401)
    expect(response.body.message).toBeDefined()
  })

  it('should return 401 when not authenticated', async () => {
    const basePower = await createBasePower()
    const awakenedPower = await createAwakenedPower()

    const response = await request(app)
      .post('/power-awakening')
      .send({ basePowerId: basePower.id, awakenedPowerId: awakenedPower.id })

    expect(response.status).toBe(401)
    expect(response.body.message).toBeDefined()
  })

  it('should return 404 when base power does not exist', async () => {
    const cookie = await createAdminAndGetCookie()
    const awakenedPower = await createAwakenedPower()

    const response = await request(app)
      .post('/power-awakening')
      .set('Cookie', cookie)
      .send({ basePowerId: 'non-existing-id', awakenedPowerId: awakenedPower.id })

    expect(response.status).toBe(404)
    expect(response.body.message).toBeDefined()
  })

  it('should return 404 when awakened power does not exist', async () => {
    const cookie = await createAdminAndGetCookie()
    const basePower = await createBasePower()

    const response = await request(app)
      .post('/power-awakening')
      .set('Cookie', cookie)
      .send({ basePowerId: basePower.id, awakenedPowerId: 'non-existing-id' })

    expect(response.status).toBe(404)
    expect(response.body.message).toBeDefined()
  })

  it('should return 400 when base power cannot awaken', async () => {
    const cookie = await createAdminAndGetCookie()
    const basePower = await prisma.power.create({
      data: { name: 'Water', description: 'Water-based power', pillar: 'MATERIAL', canAwaken: false },
    })
    const awakenedPower = await createAwakenedPower()

    const response = await request(app)
      .post('/power-awakening')
      .set('Cookie', cookie)
      .send({ basePowerId: basePower.id, awakenedPowerId: awakenedPower.id })

    expect(response.status).toBe(400)
    expect(response.body.message).toBeDefined()
  })

  it('should return 400 when awakened power is not marked as awakened', async () => {
    const cookie = await createAdminAndGetCookie()
    const basePower = await createBasePower()
    const notAwakenedPower = await prisma.power.create({
      data: { name: 'Ice', description: 'Ice-based power', pillar: 'MATERIAL', isAwakened: false },
    })

    const response = await request(app)
      .post('/power-awakening')
      .set('Cookie', cookie)
      .send({ basePowerId: basePower.id, awakenedPowerId: notAwakenedPower.id })

    expect(response.status).toBe(400)
    expect(response.body.message).toBeDefined()
  })

  it('should return 409 when the awakening pair already exists', async () => {
    const cookie = await createAdminAndGetCookie()
    const basePower = await createBasePower()
    const awakenedPower = await createAwakenedPower()

    await request(app)
      .post('/power-awakening')
      .set('Cookie', cookie)
      .send({ basePowerId: basePower.id, awakenedPowerId: awakenedPower.id })

    const response = await request(app)
      .post('/power-awakening')
      .set('Cookie', cookie)
      .send({ basePowerId: basePower.id, awakenedPowerId: awakenedPower.id })

    expect(response.status).toBe(409)
    expect(response.body.message).toBeDefined()
  })

  it('should return 400 when required fields are missing', async () => {
    const cookie = await createAdminAndGetCookie()

    const response = await request(app)
      .post('/power-awakening')
      .set('Cookie', cookie)
      .send({ basePowerId: 'some-id' })

    expect(response.status).toBe(400)
    expect(response.body.errors).toBeDefined()
  })
})
