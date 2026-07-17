import { describe, it, expect, afterEach, afterAll } from 'vitest'
import request from 'supertest'
import app from '../../app'
import { prisma } from '../../config/prisma'

describe('POST /skills/options/:characterId/discard (DiscardSkillOptionsController)', () => {
  afterEach(async () => {
    await prisma.pendingSkillChoice.deleteMany()
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

  async function createCharacter(powerId: string, userId?: string) {
    return prisma.character.create({
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
        powerId,
        userId: userId ?? null,
      },
    })
  }

  it('should discard the open pending choice, decrement pendingSkillSelections and return 200', async () => {
    const cookie = await createUserAndGetCookie()
    const user = await prisma.user.findUnique({ where: { email: 'user@example.com' } })
    const power = await createPower()
    const character = await createCharacter(power.id, user!.id)

    await prisma.skill.create({
      data: {
        name: 'Skill 1',
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

    await request(app)
      .get(`/skills/options/${character.id}`)
      .set('Cookie', cookie)

    const response = await request(app)
      .post(`/skills/options/${character.id}/discard`)
      .set('Cookie', cookie)

    expect(response.status).toBe(200)

    const updatedCharacter = await prisma.character.findUnique({
      where: { id: character.id },
    })
    expect(updatedCharacter?.pendingSkillSelections).toBe(0)

    const openPending = await prisma.pendingSkillChoice.findFirst({
      where: { characterId: character.id, resolvedAt: null },
    })
    expect(openPending).toBeNull()

    const roster = await prisma.characterSkill.findMany({
      where: { characterId: character.id },
    })
    expect(roster).toHaveLength(0)
  })

  it('should return 400 when there is no open pending choice', async () => {
    const cookie = await createUserAndGetCookie()
    const user = await prisma.user.findUnique({ where: { email: 'user@example.com' } })
    const power = await createPower()
    const character = await createCharacter(power.id, user!.id)
    await prisma.character.update({
      where: { id: character.id },
      data: { pendingSkillSelections: 0 },
    })

    const response = await request(app)
      .post(`/skills/options/${character.id}/discard`)
      .set('Cookie', cookie)

    expect(response.status).toBe(400)
    expect(response.body.message).toBeDefined()
  })

  it('should return 401 when not authenticated', async () => {
    const response = await request(app).post('/skills/options/any-id/discard')

    expect(response.status).toBe(401)
    expect(response.body.message).toBeDefined()
  })
})
