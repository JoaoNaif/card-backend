import { describe, it, expect, afterEach, afterAll } from 'vitest'
import request from 'supertest'
import app from '../../app'
import { prisma } from '../../config/prisma'

describe('POST /battle (CreateBattleController)', () => {
  afterEach(async () => {
    await prisma.battle.deleteMany()
    await prisma.battleField.deleteMany()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  async function createBattleField() {
    return prisma.battleField.create({
      data: { name: 'Campo Teste', description: 'Campo para testes de batalha' },
    })
  }

  it('should create an AUTO battle and return 201', async () => {
    const battleField = await createBattleField()

    const response = await request(app).post('/battle').send({
      mode: 'AUTO',
      battleFieldId: battleField.id,
    })

    expect(response.status).toBe(201)
    expect(response.body).toMatchObject({
      id: expect.any(String),
      mode: 'AUTO',
      battleFieldId: battleField.id,
    })
  })

  it('should create a PVE battle and return 201', async () => {
    const battleField = await createBattleField()

    const response = await request(app).post('/battle').send({
      mode: 'PVE',
      battleFieldId: battleField.id,
    })

    expect(response.status).toBe(201)
    expect(response.body).toMatchObject({
      mode: 'PVE',
      battleFieldId: battleField.id,
    })
  })

  it('should create a PVP battle and return 201', async () => {
    const battleField = await createBattleField()

    const response = await request(app).post('/battle').send({
      mode: 'PVP',
      battleFieldId: battleField.id,
    })

    expect(response.status).toBe(201)
    expect(response.body).toMatchObject({
      mode: 'PVP',
      battleFieldId: battleField.id,
    })
  })

  it('should create battle with optional maxTurns', async () => {
    const battleField = await createBattleField()

    const response = await request(app).post('/battle').send({
      mode: 'AUTO',
      battleFieldId: battleField.id,
      maxTurns: 50,
    })

    expect(response.status).toBe(201)
    expect(response.body.maxTurns).toBe(50)
  })

  it('should return 400 when battleField does not exist', async () => {
    const response = await request(app).post('/battle').send({
      mode: 'AUTO',
      battleFieldId: 'non-existent-id',
    })

    expect(response.status).toBe(400)
    expect(response.body.message).toBeDefined()
  })

  it('should return 400 when mode is invalid', async () => {
    const battleField = await createBattleField()

    const response = await request(app).post('/battle').send({
      mode: 'INVALID_MODE',
      battleFieldId: battleField.id,
    })

    expect(response.status).toBe(400)
    expect(response.body.errors).toBeDefined()
  })

  it('should return 400 when required fields are missing', async () => {
    const response = await request(app).post('/battle').send({})

    expect(response.status).toBe(400)
    expect(response.body.errors).toBeDefined()
  })
})
