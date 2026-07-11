import { describe, it, expect, afterEach, afterAll } from 'vitest'
import request from 'supertest'
import app from '../../app'
import { prisma } from '../../config/prisma'
import { Ranking } from '../../entities/character'

describe('GET /characters (FetchCharacterController)', () => {
  afterEach(async () => {
    await prisma.character.deleteMany()
    await prisma.power.deleteMany()
    await prisma.user.deleteMany()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  async function createPower(name = 'Fire', description = 'Fire-based power') {
    return prisma.power.create({ data: { name, description, pillar: 'MATERIAL' } })
  }

  function characterData(powerId: string, name: string) {
    return {
      name,
      description: 'A powerful warrior',
      maxRanking: Ranking.CAOTICO,
      baseHp: 100,
      baseAtk: 50,
      baseDef: 30,
      baseSpd: 20,
      powerId,
    }
  }

  it('should return 200 with an empty list when no characters exist', async () => {
    const response = await request(app).get('/characters')

    expect(response.status).toBe(200)
    expect(response.body).toEqual([])
  })

  it('should return 200 with a list of characters', async () => {
    const power = await createPower()

    await prisma.character.createMany({
      data: [
        characterData(power.id, 'Kai'),
        characterData(power.id, 'Zara'),
      ],
    })

    const response = await request(app).get('/characters')

    expect(response.status).toBe(200)
    expect(response.body).toHaveLength(2)
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Kai' }),
        expect.objectContaining({ name: 'Zara' }),
      ])
    )
  })

  it('each character should have all expected fields', async () => {
    const power = await createPower()

    await prisma.character.create({ data: characterData(power.id, 'Kai') })

    const response = await request(app).get('/characters')

    expect(response.status).toBe(200)
    expect(response.body[0]).toMatchObject({
      id: expect.any(String),
      name: 'Kai',
      description: 'A powerful warrior',
      ranking: Ranking.DISCRETO,
      maxRanking: Ranking.CAOTICO,
      level: 1,
      xp: 0,
      breakthroughAttempts: 0,
      hp: 100,
      atk: 50,
      def: 30,
      spd: 20,
      powerId: power.id,
      createdAt: expect.any(String),
    })
  })

  it('should filter characters by search query', async () => {
    const power = await createPower()

    await prisma.character.createMany({
      data: [
        characterData(power.id, 'Kai'),
        characterData(power.id, 'Zara'),
      ],
    })

    const response = await request(app).get('/characters?search=Kai')

    expect(response.status).toBe(200)
    expect(response.body).toHaveLength(1)
    expect(response.body[0]).toMatchObject({ name: 'Kai' })
  })

  it('should paginate characters with page and limit params', async () => {
    const power = await createPower()

    await prisma.character.createMany({
      data: Array.from({ length: 15 }, (_, i) => characterData(power.id, `Character ${i + 1}`)),
    })

    const page1 = await request(app).get('/characters?page=1&limit=10')
    expect(page1.status).toBe(200)
    expect(page1.body).toHaveLength(10)

    const page2 = await request(app).get('/characters?page=2&limit=10')
    expect(page2.status).toBe(200)
    expect(page2.body).toHaveLength(5)
  })

  it('should not require authentication', async () => {
    const response = await request(app).get('/characters')

    expect(response.status).toBe(200)
  })
})
