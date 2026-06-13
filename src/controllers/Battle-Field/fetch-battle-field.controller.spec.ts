import { describe, it, expect, afterEach, afterAll } from 'vitest'
import request from 'supertest'
import app from '../../app'
import { prisma } from '../../config/prisma'

describe('GET /battle-field (FetchBattleFieldController)', () => {
  afterEach(async () => {
    await prisma.battleFieldModifier.deleteMany()
    await prisma.battleField.deleteMany()
    await prisma.trait.deleteMany()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  async function createTrait(name = 'Fire') {
    return prisma.trait.create({ data: { name, description: `${name} trait` } })
  }

  async function createBattleField(name = 'Volcano', description = 'A volcanic arena') {
    return prisma.battleField.create({ data: { name, description } })
  }

  it('should return 200 with an empty list when no battle fields exist', async () => {
    const response = await request(app).get('/battle-field')

    expect(response.status).toBe(200)
    expect(response.body).toEqual([])
  })

  it('should return 200 with a list of battle fields', async () => {
    await createBattleField('Volcano', 'A volcanic arena')
    await createBattleField('Frozen Tundra', 'An icy wasteland')

    const response = await request(app).get('/battle-field')

    expect(response.status).toBe(200)
    expect(response.body).toHaveLength(2)
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Volcano' }),
        expect.objectContaining({ name: 'Frozen Tundra' }),
      ])
    )
  })

  it('each battle field should have id, name, description, modifiers and createdAt', async () => {
    await createBattleField('Volcano', 'A volcanic arena')

    const response = await request(app).get('/battle-field')

    expect(response.status).toBe(200)
    expect(response.body[0]).toMatchObject({
      id: expect.any(String),
      name: 'Volcano',
      description: 'A volcanic arena',
      modifiers: [],
      createdAt: expect.any(String),
    })
  })

  it('should return modifiers with correct shape when a battle field has modifiers', async () => {
    const trait = await createTrait('Infernal')
    const battleField = await createBattleField('Hell Gate', 'A gate to hell')

    await prisma.battleFieldModifier.create({
      data: {
        battleFieldId: battleField.id,
        traitId: trait.id,
        stat: 'ATK',
        bonusType: 'PERCENT',
        bonusValue: 20,
      },
    })

    const response = await request(app).get('/battle-field')

    expect(response.status).toBe(200)
    expect(response.body[0].modifiers).toHaveLength(1)
    expect(response.body[0].modifiers[0]).toMatchObject({
      id: expect.any(String),
      traitId: trait.id,
      traitName: trait.name,
      stat: 'ATK',
      bonusType: 'PERCENT',
      bonusValue: 20,
    })
  })

  it('should filter battle fields by search query', async () => {
    await createBattleField('Volcano', 'A volcanic arena')
    await createBattleField('Frozen Tundra', 'An icy wasteland')

    const response = await request(app).get('/battle-field?search=Volcano')

    expect(response.status).toBe(200)
    expect(response.body).toHaveLength(1)
    expect(response.body[0]).toMatchObject({ name: 'Volcano' })
  })

  it('should paginate battle fields with page and limit params', async () => {
    await Promise.all(
      Array.from({ length: 15 }, (_, i) =>
        prisma.battleField.create({
          data: { name: `Arena ${i + 1}`, description: `Description ${i + 1}` },
        })
      )
    )

    const page1 = await request(app).get('/battle-field?page=1&limit=10')
    expect(page1.status).toBe(200)
    expect(page1.body).toHaveLength(10)

    const page2 = await request(app).get('/battle-field?page=2&limit=10')
    expect(page2.status).toBe(200)
    expect(page2.body).toHaveLength(5)
  })

  it('should not require authentication', async () => {
    const response = await request(app).get('/battle-field')

    expect(response.status).toBe(200)
  })
})
