import { describe, it, expect, afterEach, afterAll } from 'vitest'
import request from 'supertest'
import app from '../../app'
import { prisma } from '../../config/prisma'

describe('GET /skills (FetchSkillController)', () => {
  afterEach(async () => {
    await prisma.skill.deleteMany()
    await prisma.power.deleteMany()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  async function createPower(name = 'Fire', description = 'Fire-based power') {
    return prisma.power.create({
      data: { name, description, canAwaken: false, isAwakened: false, pillar: 'BIOLOGICA' },
    })
  }

  const baseSkill = {
    cooldownTurns: 2,
    debuffStat: 'HP',
    debuffValue: 10,
    debuffDuration: 2,
  }

  it('should return 200 with an empty list when no skills exist', async () => {
    const response = await request(app).get('/skills')

    expect(response.status).toBe(200)
    expect(response.body).toEqual([])
  })

  it('should return 200 with a list of skills', async () => {
    const power = await createPower()

    await prisma.skill.createMany({
      data: [
        { name: 'Fireball', description: 'Launches a fireball', limitation: 'Once per turn', ...baseSkill, minLevel: 5, powerId: power.id },
        { name: 'Fire Shield', description: 'Creates a fire shield', limitation: 'Passive', ...baseSkill, minLevel: 10, powerId: power.id },
      ],
    })

    const response = await request(app).get('/skills')

    expect(response.status).toBe(200)
    expect(response.body).toHaveLength(2)
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Fireball' }),
        expect.objectContaining({ name: 'Fire Shield' }),
      ])
    )
  })

  it('each skill should have id, name, description, debuff fields, minLevel, limitation, powerId and createdAt', async () => {
    const power = await createPower()

    await prisma.skill.create({
      data: { name: 'Fireball', description: 'Launches a fireball', limitation: 'Once per turn', ...baseSkill, minLevel: 5, powerId: power.id },
    })

    const response = await request(app).get('/skills')

    expect(response.status).toBe(200)
    expect(response.body[0]).toMatchObject({
      id: expect.any(String),
      name: 'Fireball',
      description: 'Launches a fireball',
      limitation: 'Once per turn',
      cooldownTurns: 2,
      debuffStat: 'HP',
      debuffValue: 10,
      debuffDuration: 2,
      minLevel: 5,
      powerId: power.id,
      createdAt: expect.any(String),
    })
  })

  it('should filter skills by search query', async () => {
    const power = await createPower()

    await prisma.skill.createMany({
      data: [
        { name: 'Fireball', description: 'Launches a fireball', limitation: 'Once per turn', ...baseSkill, minLevel: 5, powerId: power.id },
        { name: 'Ice Shard', description: 'Throws an ice shard', limitation: 'None', ...baseSkill, minLevel: 1, powerId: power.id },
      ],
    })

    const response = await request(app).get('/skills?search=Fireball')

    expect(response.status).toBe(200)
    expect(response.body).toHaveLength(1)
    expect(response.body[0]).toMatchObject({ name: 'Fireball' })
  })

  it('should paginate skills with page and limit params', async () => {
    const power = await createPower()

    await prisma.skill.createMany({
      data: Array.from({ length: 15 }, (_, i) => ({
        name: `Skill ${i + 1}`,
        description: `Description ${i + 1}`,
        limitation: 'None',
        ...baseSkill,
        minLevel: i + 1,
        powerId: power.id,
      })),
    })

    const page1 = await request(app).get('/skills?page=1&limit=10')
    expect(page1.status).toBe(200)
    expect(page1.body).toHaveLength(10)

    const page2 = await request(app).get('/skills?page=2&limit=10')
    expect(page2.status).toBe(200)
    expect(page2.body).toHaveLength(5)
  })

  it('should not require authentication', async () => {
    const response = await request(app).get('/skills')

    expect(response.status).toBe(200)
  })
})
