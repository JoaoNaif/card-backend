import { afterAll, afterEach, describe, expect, it } from 'vitest'
import request from 'supertest'
import app from '../../app'
import { prisma } from '../../config/prisma'

describe('GET /battle/machines/:machineId (GetMachineTeamController)', () => {
  afterEach(async () => {
    await prisma.machineMember.deleteMany()
    await prisma.machine.deleteMany()
    await prisma.character.deleteMany()
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

  async function createMachine(label: string, characterId: string) {
    return prisma.machine.create({
      data: {
        label,
        name: 'Sentinelas de Treino',
        members: {
          create: [{ characterId, positionRow: 0, positionCol: 0 }],
        },
      },
    })
  }

  it('should return the machine team when it exists', async () => {
    const power = await createPower()
    const char = await createCharacter(power.id)
    await createMachine('M1', char.id)

    const response = await request(app).get('/battle/machines/M1')

    expect(response.status).toBe(200)
    expect(response.body).toMatchObject({
      label: 'M1',
      name: 'Sentinelas de Treino',
      members: [{ characterId: char.id, positionRow: 0, positionCol: 0 }],
    })
  })

  it('should return the machine team when fetched by id', async () => {
    const power = await createPower()
    const char = await createCharacter(power.id)
    const machine = await createMachine('M1', char.id)

    const response = await request(app).get(`/battle/machines/${machine.id}`)

    expect(response.status).toBe(200)
    expect(response.body).toMatchObject({
      id: machine.id,
      label: 'M1',
      name: 'Sentinelas de Treino',
    })
  })

  it('should return 404 when the machine does not exist', async () => {
    const response = await request(app).get('/battle/machines/M2')

    expect(response.status).toBe(404)
    expect(response.body.message).toBeDefined()
  })
})
