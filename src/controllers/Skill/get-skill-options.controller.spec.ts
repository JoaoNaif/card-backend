import { describe, it, expect, afterEach, afterAll } from 'vitest'
import request from 'supertest'
import app from '../../app'
import { prisma } from '../../config/prisma'

describe('GET /skills/options/:characterId (GetSkillOptionsController)', () => {
  afterEach(async () => {
    await prisma.characterSkill.deleteMany()
    await prisma.character.deleteMany()
    await prisma.skill.deleteMany()
    await prisma.power.deleteMany()
    await prisma.user.deleteMany()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

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

  async function createPower() {
    return prisma.power.create({
      data: {
        name: 'Fire',
        description: 'Fire-based power',
        canAwaken: false,
        isAwakened: false,
        pillar: 'MATERIAL',
      },
    })
  }

  it('should return 200 with skill options', async () => {
    const cookie = await createUserAndGetCookie()
    const user = await prisma.user.findUnique({ where: { email: 'user@example.com' } })
    const power = await createPower()

    const character = await prisma.character.create({
      data: {
        name: 'Kai',
        description: 'A warrior',
        maxRanking: 'CAOTICO',
        baseHp: 100,
        baseAtk: 50,
        baseDef: 30,
        baseSpd: 20,
        level: 10,
        pendingSkillSelections: 1,
        powerId: power.id,
        userId: user!.id,
      },
    })

    await Promise.all(
      Array.from({ length: 3 }).map((_, i) =>
        prisma.skill.create({
          data: {
            name: `Skill ${i}`,
            description: 'A skill',
            limitation: 'Once per turn',
            cooldownTurns: 0,
            debuffStat: 'HP',
            debuffValue: 10,
            debuffDuration: 2,
            minLevel: 1,
            powerId: power.id,
          },
        })
      )
    )

    const response = await request(app)
      .get(`/skills/options/${character.id}`)
      .set('Cookie', cookie)

    expect(response.status).toBe(200)
    expect(Array.isArray(response.body)).toBe(true)
    expect(response.body.length).toBeGreaterThan(0)
    expect(response.body[0]).toMatchObject({
      id: expect.any(String),
      name: expect.any(String),
      powerId: power.id,
    })
  })

  it('should exclude already owned skills from the options', async () => {
    const cookie = await createUserAndGetCookie()
    const user = await prisma.user.findUnique({ where: { email: 'user@example.com' } })
    const power = await createPower()

    const character = await prisma.character.create({
      data: {
        name: 'Kai',
        description: 'A warrior',
        maxRanking: 'CAOTICO',
        baseHp: 100,
        baseAtk: 50,
        baseDef: 30,
        baseSpd: 20,
        level: 10,
        pendingSkillSelections: 1,
        powerId: power.id,
        userId: user!.id,
      },
    })

    const [ownedSkill, ...otherSkills] = await Promise.all(
      Array.from({ length: 4 }).map((_, i) =>
        prisma.skill.create({
          data: {
            name: `Skill ${i}`,
            description: 'A skill',
            limitation: 'Once per turn',
            cooldownTurns: 0,
            debuffStat: 'HP',
            debuffValue: 10,
            debuffDuration: 2,
            minLevel: 1,
            powerId: power.id,
          },
        })
      )
    )

    await prisma.characterSkill.create({
      data: { characterId: character.id, skillId: ownedSkill!.id },
    })

    const response = await request(app)
      .get(`/skills/options/${character.id}`)
      .set('Cookie', cookie)

    expect(response.status).toBe(200)
    const returnedIds = (response.body as { id: string }[]).map((s) => s.id)
    expect(returnedIds).not.toContain(ownedSkill!.id)
  })

  it('should return 400 when character has no pending skill selections', async () => {
    const cookie = await createUserAndGetCookie()
    const user = await prisma.user.findUnique({ where: { email: 'user@example.com' } })
    const power = await createPower()

    const character = await prisma.character.create({
      data: {
        name: 'Kai',
        description: 'A warrior',
        maxRanking: 'CAOTICO',
        baseHp: 100,
        baseAtk: 50,
        baseDef: 30,
        baseSpd: 20,
        pendingSkillSelections: 0,
        powerId: power.id,
        userId: user!.id,
      },
    })

    const response = await request(app)
      .get(`/skills/options/${character.id}`)
      .set('Cookie', cookie)

    expect(response.status).toBe(400)
    expect(response.body.message).toBeDefined()
  })

  it('should return 400 when character does not belong to authenticated user', async () => {
    const cookie = await createUserAndGetCookie()
    const power = await createPower()

    const character = await prisma.character.create({
      data: {
        name: 'Kai',
        description: 'A warrior',
        maxRanking: 'CAOTICO',
        baseHp: 100,
        baseAtk: 50,
        baseDef: 30,
        baseSpd: 20,
        pendingSkillSelections: 1,
        powerId: power.id,
      },
    })

    const response = await request(app)
      .get(`/skills/options/${character.id}`)
      .set('Cookie', cookie)

    expect(response.status).toBe(400)
    expect(response.body.message).toBeDefined()
  })

  it('should return 400 when character does not exist', async () => {
    const cookie = await createUserAndGetCookie()

    const response = await request(app)
      .get('/skills/options/non-existent-id')
      .set('Cookie', cookie)

    expect(response.status).toBe(400)
    expect(response.body.message).toBeDefined()
  })

  it('should return 401 when not authenticated', async () => {
    const response = await request(app).get('/skills/options/any-id')

    expect(response.status).toBe(401)
    expect(response.body.message).toBeDefined()
  })
})
