import { describe, it, expect, afterEach, afterAll } from 'vitest'
import request from 'supertest'
import app from '../../app'
import { prisma } from '../../config/prisma'
import { Ranking } from '../../entities/character'

describe('GET /characters/:characterId (GetCharacterController)', () => {
  afterEach(async () => {
    await prisma.characterSkill.deleteMany()
    await prisma.character.deleteMany()
    await prisma.skill.deleteMany()
    await prisma.power.deleteMany()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  async function createCharacter() {
    const power = await prisma.power.create({
      data: {
        name: 'Fire',
        description: 'Fire-based power',
        pillar: 'MATERIAL',
        canAwaken: false,
        isAwakened: false,
      },
    })

    const character = await prisma.character.create({
      data: {
        name: 'Test Hero',
        description: 'A test character',
        ranking: Ranking.DISCRETO,
        maxRanking: Ranking.CAOTICO,
        level: 1,
        xp: 0,
        breakthroughAttempts: 0,
        baseHp: 100,
        baseAtk: 50,
        baseDef: 30,
        baseSpd: 20,
        powerId: power.id,
      },
    })

    return { power, character }
  }

  it('should return 200 with character and power data', async () => {
    const { character, power } = await createCharacter()

    const response = await request(app).get(`/characters/${character.id}`)

    expect(response.status).toBe(200)
    expect(response.body).toMatchObject({
      id: character.id,
      name: 'Test Hero',
      ranking: Ranking.DISCRETO,
      level: 1,
      xp: 0,
      power: {
        id: power.id,
        name: 'Fire',
        pillar: 'MATERIAL',
      },
      skills: [],
      traits: [],
    })
    expect(response.body.createdAt).toBeDefined()
  })

  it('should return character with skills when character has skills assigned', async () => {
    const { character, power } = await createCharacter()

    const skill = await prisma.skill.create({
      data: {
        name: 'Fireball',
        description: 'Launches a fireball',
        limitation: 'Once per turn',
        cooldownTurns: 2,
        debuffStat: 'HP',
        debuffValue: 10,
        debuffDuration: 2,
        minLevel: 1,
        powerId: power.id,
      },
    })

    await prisma.characterSkill.create({
      data: { characterId: character.id, skillId: skill.id },
    })

    const response = await request(app).get(`/characters/${character.id}`)

    expect(response.status).toBe(200)
    expect(response.body.skills).toHaveLength(1)
    expect(response.body.skills[0]).toMatchObject({
      id: skill.id,
      name: 'Fireball',
    })
  })

  it('should return 404 when character does not exist', async () => {
    const response = await request(app).get('/characters/non-existent-id')

    expect(response.status).toBe(404)
    expect(response.body.message).toBeDefined()
  })

  it('should not require authentication', async () => {
    const { character } = await createCharacter()

    const response = await request(app).get(`/characters/${character.id}`)

    expect(response.status).toBe(200)
  })
})
