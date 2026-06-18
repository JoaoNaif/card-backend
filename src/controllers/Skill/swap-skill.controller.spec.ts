import { describe, it, expect, afterEach, afterAll } from 'vitest'
import request from 'supertest'
import app from '../../app'
import { prisma } from '../../config/prisma'
import { Ranking } from '../../entities/character'

describe('PATCH /skills/swap (SwapSkillController)', () => {
  afterEach(async () => {
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
    password = '123456'
  ) {
    await request(app).post('/users').send({
      name: 'Regular User',
      email,
      password,
    })

    const authResponse = await request(app)
      .post('/users/authenticate')
      .send({ email, password })

    return authResponse.headers['set-cookie'] as unknown as string[]
  }

  async function createPower() {
    return prisma.power.create({
      data: { name: 'Fire', description: 'Fire-based power', pillar: 'MATERIAL' },
    })
  }

  let charCounter = 0
  let skillCounter = 0

  async function createCharacter(powerId: string, userId?: string) {
    return prisma.character.create({
      data: {
        name: `Character-${++charCounter}`,
        description: 'A warrior',
        maxRanking: Ranking.CAOTICO,
        baseHp: 100,
        baseAtk: 50,
        baseDef: 30,
        baseSpd: 20,
        powerId,
        userId: userId ?? null,
      },
    })
  }

  async function createSkill(powerId: string) {
    return prisma.skill.create({
      data: {
        name: `Skill-${++skillCounter}`,
        description: 'A skill',
        limitation: 'No limitation',
        debuffStat: 'HP',
        debuffValue: 10,
        debuffDuration: 2,
        minLevel: 1,
        powerId,
      },
    })
  }

  async function assignSkill(characterId: string, skillId: string) {
    return prisma.characterSkill.create({ data: { characterId, skillId } })
  }

  it('should swap a skill and return 201', async () => {
    const cookie = await createUserAndGetCookie()
    const user = await prisma.user.findUnique({ where: { email: 'user@example.com' } })

    const power = await createPower()
    const character = await createCharacter(power.id, user!.id)

    const skills = await Promise.all(
      Array.from({ length: 4 }, () => createSkill(power.id))
    )
    for (const skill of skills) await assignSkill(character.id, skill.id)

    const newSkill = await createSkill(power.id)

    const response = await request(app)
      .patch('/skills/swap')
      .set('Cookie', cookie)
      .send({
        characterId: character.id,
        currentSkillId: skills[0]!.id,
        newSkillId: newSkill.id,
      })

    expect(response.status).toBe(201)

    const roster = await prisma.characterSkill.findMany({
      where: { characterId: character.id },
    })
    const rosterIds = roster.map((cs) => cs.skillId)
    expect(rosterIds).not.toContain(skills[0]!.id)
    expect(rosterIds).toContain(newSkill.id)
  })

  it('should return 400 when roster is not full', async () => {
    const cookie = await createUserAndGetCookie()
    const user = await prisma.user.findUnique({ where: { email: 'user@example.com' } })

    const power = await createPower()
    const character = await createCharacter(power.id, user!.id)

    const skill = await createSkill(power.id)
    await assignSkill(character.id, skill.id)

    const newSkill = await createSkill(power.id)

    const response = await request(app)
      .patch('/skills/swap')
      .set('Cookie', cookie)
      .send({
        characterId: character.id,
        currentSkillId: skill.id,
        newSkillId: newSkill.id,
      })

    expect(response.status).toBe(400)
    expect(response.body.message).toBeDefined()
  })

  it('should return 400 when currentSkill is not assigned to character', async () => {
    const cookie = await createUserAndGetCookie()
    const user = await prisma.user.findUnique({ where: { email: 'user@example.com' } })

    const power = await createPower()
    const character = await createCharacter(power.id, user!.id)

    const skills = await Promise.all(
      Array.from({ length: 4 }, () => createSkill(power.id))
    )
    for (const skill of skills) await assignSkill(character.id, skill.id)

    const unassignedSkill = await createSkill(power.id)
    const newSkill = await createSkill(power.id)

    const response = await request(app)
      .patch('/skills/swap')
      .set('Cookie', cookie)
      .send({
        characterId: character.id,
        currentSkillId: unassignedSkill.id,
        newSkillId: newSkill.id,
      })

    expect(response.status).toBe(400)
    expect(response.body.message).toBeDefined()
  })

  it('should return 400 when newSkill does not exist', async () => {
    const cookie = await createUserAndGetCookie()
    const user = await prisma.user.findUnique({ where: { email: 'user@example.com' } })

    const power = await createPower()
    const character = await createCharacter(power.id, user!.id)

    const skills = await Promise.all(
      Array.from({ length: 4 }, () => createSkill(power.id))
    )
    for (const skill of skills) await assignSkill(character.id, skill.id)

    const response = await request(app)
      .patch('/skills/swap')
      .set('Cookie', cookie)
      .send({
        characterId: character.id,
        currentSkillId: skills[0]!.id,
        newSkillId: 'non-existent-id',
      })

    expect(response.status).toBe(400)
    expect(response.body.message).toBeDefined()
  })

  it('should return 400 when newSkill belongs to a different power', async () => {
    const cookie = await createUserAndGetCookie()
    const user = await prisma.user.findUnique({ where: { email: 'user@example.com' } })

    const power = await createPower()
    const character = await createCharacter(power.id, user!.id)

    const skills = await Promise.all(
      Array.from({ length: 4 }, () => createSkill(power.id))
    )
    for (const skill of skills) await assignSkill(character.id, skill.id)

    const otherPower = await prisma.power.create({
      data: { name: 'Water', description: 'Water-based power', pillar: 'VETORIAL' },
    })
    const wrongPowerSkill = await createSkill(otherPower.id)

    const response = await request(app)
      .patch('/skills/swap')
      .set('Cookie', cookie)
      .send({
        characterId: character.id,
        currentSkillId: skills[0]!.id,
        newSkillId: wrongPowerSkill.id,
      })

    expect(response.status).toBe(400)
    expect(response.body.message).toBeDefined()
  })

  it('should return 400 when body fields are missing', async () => {
    const cookie = await createUserAndGetCookie()

    const response = await request(app)
      .patch('/skills/swap')
      .set('Cookie', cookie)
      .send({})

    expect(response.status).toBe(400)
    expect(response.body.errors).toBeDefined()
  })

  it('should return 401 when not authenticated', async () => {
    const response = await request(app)
      .patch('/skills/swap')
      .send({
        characterId: 'any-id',
        currentSkillId: 'any-id',
        newSkillId: 'any-id',
      })

    expect(response.status).toBe(401)
    expect(response.body.message).toBeDefined()
  })
})
