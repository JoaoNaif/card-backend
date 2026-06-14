import { describe, it, expect, afterEach, afterAll } from 'vitest'
import request from 'supertest'
import app from '../../app'
import { prisma } from '../../config/prisma'

describe('GET /skills/:skillId (GetSkillController)', () => {
  afterEach(async () => {
    await prisma.skill.deleteMany()
    await prisma.power.deleteMany()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  async function createPowerAndSkill() {
    const power = await prisma.power.create({
      data: { name: 'Fire', description: 'Fire-based power', canAwaken: false, isAwakened: false, pillar: 'BIOLOGICA' },
    })

    const skill = await prisma.skill.create({
      data: {
        name: 'Fireball',
        description: 'Launches a fireball',
        limitation: 'Once per turn',
        cooldownTurns: 2,
        debuffStat: 'HP',
        debuffValue: 10,
        debuffDuration: 2,
        minLevel: 5,
        powerId: power.id,
      },
    })

    return { power, skill }
  }

  it('should return 200 with skill and power data when skill exists', async () => {
    const { power, skill } = await createPowerAndSkill()

    const response = await request(app).get(`/skills/${skill.id}`)

    expect(response.status).toBe(200)
    expect(response.body).toMatchObject({
      id: skill.id,
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
      power: {
        id: power.id,
        name: 'Fire',
        description: 'Fire-based power',
        createdAt: expect.any(String),
      },
    })
  })

  it('should return 404 when skill does not exist', async () => {
    const response = await request(app).get('/skills/non-existent-id')

    expect(response.status).toBe(404)
    expect(response.body.message).toBeDefined()
  })

  it('should not require authentication', async () => {
    const { skill } = await createPowerAndSkill()

    const response = await request(app).get(`/skills/${skill.id}`)

    expect(response.status).toBe(200)
  })
})
