import { describe, it, expect, afterEach, afterAll } from 'vitest'
import request from 'supertest'
import app from '../../app'
import { prisma } from '../../config/prisma'

describe('DELETE /skills/remove (RemoveSkillController)', () => {
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

  async function createAdminAndGetCookie() {
    await request(app).post('/users').send({
      name: 'Admin User',
      email: 'admin@example.com',
      password: '123456',
    })

    await prisma.user.update({
      where: { email: 'admin@example.com' },
      data: { userRole: 'ADMIN' },
    })

    const authResponse = await request(app)
      .post('/users/authenticate')
      .send({ email: 'admin@example.com', password: '123456' })

    return authResponse.headers['set-cookie'] as unknown as string[]
  }

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

  async function createPower(name = 'Fire') {
    return prisma.power.create({
      data: {
        name,
        description: 'Fire-based power',
        canAwaken: false,
        isAwakened: false,
        pillar: 'BIOLOGICA',
      },
    })
  }

  async function createSkill(powerId: string, name = 'Fireball') {
    return prisma.skill.create({
      data: {
        name,
        description: 'Launches a fireball',
        limitation: 'Once per turn',
        cooldownTurns: 2,
        debuffStat: 'HP',
        debuffValue: 10,
        debuffDuration: 2,
        targetType: 'SINGLE_ENEMY',
        damageMultiplier: 1.0,
        healMultiplier: 0,
        minLevel: 5,
        powerId,
      },
    })
  }

  async function createCharacter(powerId: string) {
    return prisma.character.create({
      data: {
        name: 'Kai',
        description: 'A powerful warrior',
        maxRanking: 'CAOTICO',
        baseHp: 100,
        baseAtk: 50,
        baseDef: 30,
        baseSpd: 20,
        powerId,
      },
    })
  }

  it('should return 204 when admin removes an existing skill', async () => {
    const cookie = await createAdminAndGetCookie()
    const power = await createPower()
    const skill = await createSkill(power.id)

    const response = await request(app)
      .delete('/skills/remove')
      .set('Cookie', cookie)
      .send({ skillId: skill.id })

    expect(response.status).toBe(204)

    const deleted = await prisma.skill.findUnique({ where: { id: skill.id } })
    expect(deleted).toBeNull()
  })

  it('should return 204 and also remove CharacterSkill associations', async () => {
    const cookie = await createAdminAndGetCookie()
    const power = await createPower()
    const skill = await createSkill(power.id)
    const character = await createCharacter(power.id)

    await prisma.characterSkill.create({
      data: { characterId: character.id, skillId: skill.id },
    })

    const response = await request(app)
      .delete('/skills/remove')
      .set('Cookie', cookie)
      .send({ skillId: skill.id })

    expect(response.status).toBe(204)

    const orphanedLink = await prisma.characterSkill.findFirst({
      where: { skillId: skill.id },
    })
    expect(orphanedLink).toBeNull()
  })

  it('should return 400 when skill does not exist', async () => {
    const cookie = await createAdminAndGetCookie()

    const response = await request(app)
      .delete('/skills/remove')
      .set('Cookie', cookie)
      .send({ skillId: 'nonexistent-id' })

    expect(response.status).toBe(400)
    expect(response.body.message).toBeDefined()
  })

  it('should return 400 when user is not an admin', async () => {
    const cookie = await createUserAndGetCookie()
    const power = await createPower()
    const skill = await createSkill(power.id)

    const response = await request(app)
      .delete('/skills/remove')
      .set('Cookie', cookie)
      .send({ skillId: skill.id })

    expect(response.status).toBe(400)
    expect(response.body.message).toBeDefined()
  })

  it('should return 400 when skillId is missing', async () => {
    const cookie = await createAdminAndGetCookie()

    const response = await request(app)
      .delete('/skills/remove')
      .set('Cookie', cookie)
      .send({})

    expect(response.status).toBe(400)
    expect(response.body.errors).toBeDefined()
  })

  it('should return 401 when not authenticated', async () => {
    const power = await createPower()
    const skill = await createSkill(power.id)

    const response = await request(app)
      .delete('/skills/remove')
      .send({ skillId: skill.id })

    expect(response.status).toBe(401)
  })
})
