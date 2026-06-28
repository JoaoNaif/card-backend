import { describe, it, expect, afterEach, afterAll } from 'vitest'
import request from 'supertest'
import app from '../../app'
import { prisma } from '../../config/prisma'

describe('PUT /skills/update (EditSkillController)', () => {
  afterEach(async () => {
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

  it('should return 204 when admin updates skill name', async () => {
    const cookie = await createAdminAndGetCookie()
    const power = await createPower()
    const skill = await createSkill(power.id)

    const response = await request(app)
      .put('/skills/update')
      .set('Cookie', cookie)
      .send({ skillId: skill.id, name: 'Mega Fireball' })

    expect(response.status).toBe(204)
  })

  it('should return 204 when admin updates skill description', async () => {
    const cookie = await createAdminAndGetCookie()
    const power = await createPower()
    const skill = await createSkill(power.id)

    const response = await request(app)
      .put('/skills/update')
      .set('Cookie', cookie)
      .send({ skillId: skill.id, description: 'Updated description' })

    expect(response.status).toBe(204)
  })

  it('should return 204 when admin updates debuff stats', async () => {
    const cookie = await createAdminAndGetCookie()
    const power = await createPower()
    const skill = await createSkill(power.id)

    const response = await request(app)
      .put('/skills/update')
      .set('Cookie', cookie)
      .send({ skillId: skill.id, debuffStat: 'ATK', debuffValue: 20, debuffDuration: 3 })

    expect(response.status).toBe(204)
  })

  it('should return 204 when admin reassigns skill to another power', async () => {
    const cookie = await createAdminAndGetCookie()
    const power1 = await createPower('Fire')
    const power2 = await createPower('Ice')
    const skill = await createSkill(power1.id)

    const response = await request(app)
      .put('/skills/update')
      .set('Cookie', cookie)
      .send({ skillId: skill.id, powerId: power2.id })

    expect(response.status).toBe(204)
  })

  it('should return 400 when new name is already taken by another skill', async () => {
    const cookie = await createAdminAndGetCookie()
    const power = await createPower()
    await createSkill(power.id, 'Fireball')
    const skill2 = await createSkill(power.id, 'Iceball')

    const response = await request(app)
      .put('/skills/update')
      .set('Cookie', cookie)
      .send({ skillId: skill2.id, name: 'Fireball' })

    expect(response.status).toBe(400)
    expect(response.body.message).toBeDefined()
  })

  it('should return 400 when skill does not exist', async () => {
    const cookie = await createAdminAndGetCookie()

    const response = await request(app)
      .put('/skills/update')
      .set('Cookie', cookie)
      .send({ skillId: 'nonexistent-id', name: 'Mega Fireball' })

    expect(response.status).toBe(400)
    expect(response.body.message).toBeDefined()
  })

  it('should return 400 when powerId does not exist', async () => {
    const cookie = await createAdminAndGetCookie()
    const power = await createPower()
    const skill = await createSkill(power.id)

    const response = await request(app)
      .put('/skills/update')
      .set('Cookie', cookie)
      .send({ skillId: skill.id, powerId: 'nonexistent-power-id' })

    expect(response.status).toBe(400)
    expect(response.body.message).toBeDefined()
  })

  it('should return 400 when user is not an admin', async () => {
    const cookie = await createUserAndGetCookie()
    const power = await createPower()
    const skill = await createSkill(power.id)

    const response = await request(app)
      .put('/skills/update')
      .set('Cookie', cookie)
      .send({ skillId: skill.id, name: 'Mega Fireball' })

    expect(response.status).toBe(400)
    expect(response.body.message).toBeDefined()
  })

  it('should return 400 when skillId is missing', async () => {
    const cookie = await createAdminAndGetCookie()

    const response = await request(app)
      .put('/skills/update')
      .set('Cookie', cookie)
      .send({ name: 'Mega Fireball' })

    expect(response.status).toBe(400)
    expect(response.body.errors).toBeDefined()
  })

  it('should return 401 when not authenticated', async () => {
    const power = await createPower()
    const skill = await createSkill(power.id)

    const response = await request(app)
      .put('/skills/update')
      .send({ skillId: skill.id, name: 'Mega Fireball' })

    expect(response.status).toBe(401)
  })
})
