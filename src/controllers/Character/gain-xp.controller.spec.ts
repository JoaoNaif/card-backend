import { describe, it, expect, afterEach, afterAll } from 'vitest'
import request from 'supertest'
import app from '../../app'
import { prisma } from '../../config/prisma'
import { Ranking } from '../../entities/character'

describe('PATCH /characters/gain-xp (GainXpController)', () => {
  afterEach(async () => {
    await prisma.character.deleteMany()
    await prisma.power.deleteMany()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  async function createCharacter(override: Partial<{
    level: number
    xp: number
    ranking: Ranking
  }> = {}) {
    const power = await prisma.power.create({
      data: { name: 'Power Test', description: 'Test power' },
    })

    return prisma.character.create({
      data: {
        name: 'Test Hero',
        description: 'A test character',
        maxRanking: Ranking.CAOTICO,
        baseHp: 100,
        baseAtk: 50,
        baseDef: 30,
        baseSpd: 20,
        powerId: power.id,
        level: override.level ?? 1,
        xp: override.xp ?? 0,
        ranking: override.ranking ?? Ranking.DISCRETO,
      },
    })
  }

  it('should gain XP without leveling up and return 201', async () => {
    const character = await createCharacter()

    const response = await request(app)
      .patch('/characters/gain-xp')
      .send({ characterId: character.id, xpAmount: 50 })

    expect(response.status).toBe(201)
    expect(response.body).toEqual({ levelsGained: 0, newLevel: 1 })

    const updated = await prisma.character.findUnique({ where: { id: character.id } })
    expect(updated?.xp).toBe(50)
    expect(updated?.level).toBe(1)
  })

  it('should level up and return levelsGained and newLevel', async () => {
    const character = await createCharacter()

    // nível 1 precisa de 100 xp
    const response = await request(app)
      .patch('/characters/gain-xp')
      .send({ characterId: character.id, xpAmount: 100 })

    expect(response.status).toBe(201)
    expect(response.body).toEqual({ levelsGained: 1, newLevel: 2 })

    const updated = await prisma.character.findUnique({ where: { id: character.id } })
    expect(updated?.level).toBe(2)
    expect(updated?.xp).toBe(0)
  })

  it('should level up multiple times with overflow XP', async () => {
    const character = await createCharacter()

    // nível 1→100, 2→200, 3→300 = 600 total
    const response = await request(app)
      .patch('/characters/gain-xp')
      .send({ characterId: character.id, xpAmount: 600 })

    expect(response.status).toBe(201)
    expect(response.body).toEqual({ levelsGained: 3, newLevel: 4 })
  })

  it('should cap at maxLevel and discard excess XP', async () => {
    const character = await createCharacter({ ranking: Ranking.DISCRETO, level: 19 })

    const response = await request(app)
      .patch('/characters/gain-xp')
      .send({ characterId: character.id, xpAmount: 9999 })

    expect(response.status).toBe(201)
    expect(response.body).toEqual({ levelsGained: 1, newLevel: 20 })

    const updated = await prisma.character.findUnique({ where: { id: character.id } })
    expect(updated?.xp).toBe(0)
  })

  it('should return 400 when character does not exist', async () => {
    const response = await request(app)
      .patch('/characters/gain-xp')
      .send({ characterId: 'non-existent-id', xpAmount: 100 })

    expect(response.status).toBe(400)
    expect(response.body.message).toBeDefined()
  })

  it('should return 400 when body is missing required fields', async () => {
    const response = await request(app)
      .patch('/characters/gain-xp')
      .send({})

    expect(response.status).toBe(400)
    expect(response.body.errors).toBeDefined()
  })
})
