import { afterAll, afterEach, describe, expect, it } from 'vitest'
import request from 'supertest'
import app from '../../app'
import { prisma } from '../../config/prisma'

describe('POST /battle/machines (CreateMachineController)', () => {
  afterEach(async () => {
    await prisma.machineMember.deleteMany()
    await prisma.machine.deleteMany()
    await prisma.character.deleteMany()
    await prisma.user.deleteMany()
    await prisma.power.deleteMany()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  async function createPower() {
    return prisma.power.create({
      data: {
        name: `Power-${Date.now()}-${Math.random()}`,
        description: 'Test power',
        pillar: 'MATERIAL',
      },
    })
  }

  async function createCharacter(powerId: string) {
    return prisma.character.create({
      data: {
        name: `Char-${Date.now()}-${Math.random()}`,
        description: 'Test character',
        ranking: 'DISCRETO',
        maxRanking: 'SINGULAR',
        level: 1,
        xp: 0,
        breakthroughAttempts: 0,
        baseHp: 100,
        baseAtk: 10,
        baseDef: 10,
        baseSpd: 10,
        powerId,
      },
    })
  }

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

  it('should create a machine and return 201 when admin is authenticated', async () => {
    const cookie = await createAdminAndGetCookie()
    const power = await createPower()
    const char = await createCharacter(power.id)

    const response = await request(app)
      .post('/battle/machines')
      .set('Cookie', cookie)
      .send({
        label: 'M1',
        name: 'Sentinelas de Treino',
        members: [{ characterId: char.id, positionRow: 0, positionCol: 0 }],
      })

    expect(response.status).toBe(201)
    expect(response.body).toMatchObject({
      label: 'M1',
      name: 'Sentinelas de Treino',
      members: [{ characterId: char.id, positionRow: 0, positionCol: 0 }],
    })

    const machine = await prisma.machine.findUnique({ where: { label: 'M1' } })
    expect(machine).not.toBeNull()
  })

  it('should return 400 when user is not an admin', async () => {
    const cookie = await createUserAndGetCookie()
    const power = await createPower()
    const char = await createCharacter(power.id)

    const response = await request(app)
      .post('/battle/machines')
      .set('Cookie', cookie)
      .send({
        label: 'M1',
        name: 'Sentinelas de Treino',
        members: [{ characterId: char.id, positionRow: 0, positionCol: 0 }],
      })

    expect(response.status).toBe(400)
    expect(response.body.message).toBeDefined()

    const machine = await prisma.machine.findUnique({ where: { label: 'M1' } })
    expect(machine).toBeNull()
  })

  it('should return 401 when not authenticated', async () => {
    const response = await request(app)
      .post('/battle/machines')
      .send({
        label: 'M1',
        name: 'Sentinelas de Treino',
        members: [{ characterId: 'some-id', positionRow: 0, positionCol: 0 }],
      })

    expect(response.status).toBe(401)
    expect(response.body.message).toBeDefined()
  })

  it('should return 400 when label already exists', async () => {
    const cookie = await createAdminAndGetCookie()
    const power = await createPower()
    const char1 = await createCharacter(power.id)
    const char2 = await createCharacter(power.id)

    await request(app)
      .post('/battle/machines')
      .set('Cookie', cookie)
      .send({
        label: 'M1',
        name: 'Sentinelas de Treino',
        members: [{ characterId: char1.id, positionRow: 0, positionCol: 0 }],
      })

    const response = await request(app)
      .post('/battle/machines')
      .set('Cookie', cookie)
      .send({
        label: 'M1',
        name: 'Outro Nome',
        members: [{ characterId: char2.id, positionRow: 0, positionCol: 0 }],
      })

    expect(response.status).toBe(400)
    expect(response.body.message).toBeDefined()
  })

  it('should return 400 when a character does not exist', async () => {
    const cookie = await createAdminAndGetCookie()

    const response = await request(app)
      .post('/battle/machines')
      .set('Cookie', cookie)
      .send({
        label: 'M1',
        name: 'Sentinelas de Treino',
        members: [{ characterId: 'non-existent', positionRow: 0, positionCol: 0 }],
      })

    expect(response.status).toBe(400)
    expect(response.body.message).toBeDefined()
  })

  it('should return 400 when required fields are missing', async () => {
    const cookie = await createAdminAndGetCookie()

    const response = await request(app)
      .post('/battle/machines')
      .set('Cookie', cookie)
      .send({ label: 'M1' })

    expect(response.status).toBe(400)
    expect(response.body.errors).toBeDefined()
  })
})
