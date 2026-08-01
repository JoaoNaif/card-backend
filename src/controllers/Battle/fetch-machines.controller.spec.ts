import { afterAll, afterEach, describe, expect, it } from 'vitest'
import request from 'supertest'
import app from '../../app'
import { prisma } from '../../config/prisma'

describe('GET /battle/machines (FetchMachinesController)', () => {
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

  async function createMachine(label: string, name: string, characterId: string) {
    return prisma.machine.create({
      data: {
        label,
        name,
        members: {
          create: [{ characterId, positionRow: 0, positionCol: 0 }],
        },
      },
    })
  }

  it('should return an empty list when there are no machines', async () => {
    const response = await request(app).get('/battle/machines')

    expect(response.status).toBe(200)
    expect(response.body).toEqual([])
  })

  it('should return all machines with a summarized character for each member', async () => {
    const power = await createPower()
    const char1 = await createCharacter(power.id)
    const char2 = await createCharacter(power.id)

    const machine1 = await createMachine('M1', 'Sentinelas de Treino', char1.id)
    const machine2 = await createMachine('M2', 'Guardiões Avançados', char2.id)

    const response = await request(app).get('/battle/machines')

    expect(response.status).toBe(200)
    expect(response.body).toHaveLength(2)
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: machine1.id,
          label: 'M1',
          name: 'Sentinelas de Treino',
          members: [
            expect.objectContaining({
              characterId: char1.id,
              positionRow: 0,
              positionCol: 0,
              character: expect.objectContaining({
                id: char1.id,
                power: expect.objectContaining({ id: power.id }),
              }),
            }),
          ],
        }),
        expect.objectContaining({
          id: machine2.id,
          label: 'M2',
          name: 'Guardiões Avançados',
          members: [
            expect.objectContaining({
              characterId: char2.id,
              positionRow: 0,
              positionCol: 0,
              character: expect.objectContaining({
                id: char2.id,
                power: expect.objectContaining({ id: power.id }),
              }),
            }),
          ],
        }),
      ])
    )

    const member = response.body
      .find((m: { label: string }) => m.label === 'M1')
      .members[0]
    expect(member.character.skills).toBeUndefined()
    expect(member.character.traits).toBeUndefined()
  })
})
