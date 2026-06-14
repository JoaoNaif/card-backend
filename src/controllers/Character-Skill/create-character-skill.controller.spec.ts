import { describe, it, expect, afterEach, afterAll } from 'vitest'
import request from 'supertest'
import app from '../../app'
import { prisma } from '../../config/prisma'
import { Ranking } from '../../entities/character'

describe('POST /character-skills (CreateCharacterSkillController)', () => {
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

  async function createUserAndGetCookie(
    email = 'user@example.com',
    name = 'Regular User'
  ) {
    await request(app).post('/users').send({ name, email, password: '123456' })
    const authResponse = await request(app)
      .post('/users/authenticate')
      .send({ email, password: '123456' })
    return {
      cookie: authResponse.headers['set-cookie'] as unknown as string[],
      userId: (await prisma.user.findUnique({ where: { email } }))!.id,
    }
  }

  async function createPowerAndSkill() {
    const power = await prisma.power.create({
      data: { name: 'Fire', description: 'Fire-based power' },
    })
    const skill = await prisma.skill.create({
      data: {
        name: 'Fireball',
        description: 'Launches a fireball',
        limitation: 'Once per turn',
        cost: 3,
        minLevel: 1,
        powerId: power.id,
      },
    })
    return { power, skill }
  }

  async function createCharacterForUser(userId: string, powerId: string) {
    return prisma.character.create({
      data: {
        name: 'Kai',
        description: 'A powerful warrior',
        userId,
        ranking: Ranking.DISCRETO,
        maxRanking: Ranking.CAOTICO,
        level: 1,
        xp: 0,
        breakthroughAttempts: 0,
        baseHp: 100,
        baseAtk: 50,
        baseDef: 30,
        baseSpd: 20,
        powerId,
      },
    })
  }

  it('should assign a skill to own character and return 201', async () => {
    const { cookie, userId } = await createUserAndGetCookie()
    const { power, skill } = await createPowerAndSkill()
    const character = await createCharacterForUser(userId, power.id)

    const response = await request(app)
      .post('/character-skills')
      .set('Cookie', cookie)
      .send({ characterId: character.id, skillId: skill.id })

    expect(response.status).toBe(201)
    expect(response.body).toMatchObject({
      id: expect.any(String),
      characterId: character.id,
      skillId: skill.id,
      assignedAt: expect.any(String),
    })
  })

  it('should return 400 when character-skill already exists', async () => {
    const { cookie, userId } = await createUserAndGetCookie()
    const { power, skill } = await createPowerAndSkill()
    const character = await createCharacterForUser(userId, power.id)

    await request(app)
      .post('/character-skills')
      .set('Cookie', cookie)
      .send({ characterId: character.id, skillId: skill.id })

    const response = await request(app)
      .post('/character-skills')
      .set('Cookie', cookie)
      .send({ characterId: character.id, skillId: skill.id })

    expect(response.status).toBe(400)
    expect(response.body.message).toBeDefined()
  })

  it('should return 400 when skill does not exist', async () => {
    const { cookie, userId } = await createUserAndGetCookie()
    const { power } = await createPowerAndSkill()
    const character = await createCharacterForUser(userId, power.id)

    const response = await request(app)
      .post('/character-skills')
      .set('Cookie', cookie)
      .send({ characterId: character.id, skillId: 'nonexistentid' })

    expect(response.status).toBe(400)
    expect(response.body.message).toBeDefined()
  })

  it('should return 400 when character does not exist', async () => {
    const { cookie } = await createUserAndGetCookie()
    const { skill } = await createPowerAndSkill()

    const response = await request(app)
      .post('/character-skills')
      .set('Cookie', cookie)
      .send({ characterId: 'nonexistentid', skillId: skill.id })

    expect(response.status).toBe(400)
    expect(response.body.message).toBeDefined()
  })

  it('should return 400 when character belongs to another user', async () => {
    const { userId: ownerId } = await createUserAndGetCookie('owner@example.com', 'Owner')
    const { cookie } = await createUserAndGetCookie('other@example.com', 'Other')
    const { power, skill } = await createPowerAndSkill()
    const character = await createCharacterForUser(ownerId, power.id)

    const response = await request(app)
      .post('/character-skills')
      .set('Cookie', cookie)
      .send({ characterId: character.id, skillId: skill.id })

    expect(response.status).toBe(400)
    expect(response.body.message).toBeDefined()
  })

  it('should return 401 when not authenticated', async () => {
    const { userId } = await createUserAndGetCookie()
    const { power, skill } = await createPowerAndSkill()
    const character = await createCharacterForUser(userId, power.id)

    const response = await request(app)
      .post('/character-skills')
      .send({ characterId: character.id, skillId: skill.id })

    expect(response.status).toBe(401)
    expect(response.body.message).toBeDefined()
  })

  it('should return 400 when required fields are missing', async () => {
    const { cookie } = await createUserAndGetCookie()

    const response = await request(app)
      .post('/character-skills')
      .set('Cookie', cookie)
      .send({})

    expect(response.status).toBe(400)
    expect(response.body.errors).toBeDefined()
  })
})
