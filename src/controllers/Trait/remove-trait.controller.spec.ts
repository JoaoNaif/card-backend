import { describe, it, expect, afterEach, afterAll } from 'vitest'
import request from 'supertest'
import app from '../../app'
import { prisma } from '../../config/prisma'

describe('DELETE /traits/remove (RemoveTraitController)', () => {
  afterEach(async () => {
    await prisma.trait.deleteMany()
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

  it('should remove a trait and return 204 when admin is authenticated', async () => {
    const cookie = await createAdminAndGetCookie()

    const trait = await prisma.trait.create({
      data: { name: 'Brave', description: 'A brave trait' },
    })

    const response = await request(app)
      .delete('/traits/remove')
      .set('Cookie', cookie)
      .send({ traitId: trait.id })

    expect(response.status).toBe(204)

    const deleted = await prisma.trait.findUnique({ where: { id: trait.id } })
    expect(deleted).toBeNull()
  })

  it('should return 400 when trait does not exist', async () => {
    const cookie = await createAdminAndGetCookie()

    const response = await request(app)
      .delete('/traits/remove')
      .set('Cookie', cookie)
      .send({ traitId: 'non-existing-trait-id' })

    expect(response.status).toBe(400)
    expect(response.body.message).toBeDefined()
  })

  it('should return 400 when user is not an admin', async () => {
    const cookie = await createUserAndGetCookie()

    const trait = await prisma.trait.create({
      data: { name: 'Brave', description: 'A brave trait' },
    })

    const response = await request(app)
      .delete('/traits/remove')
      .set('Cookie', cookie)
      .send({ traitId: trait.id })

    expect(response.status).toBe(400)
    expect(response.body.message).toBeDefined()
  })

  it('should return 401 when not authenticated', async () => {
    const trait = await prisma.trait.create({
      data: { name: 'Brave', description: 'A brave trait' },
    })

    const response = await request(app)
      .delete('/traits/remove')
      .send({ traitId: trait.id })

    expect(response.status).toBe(401)
    expect(response.body.message).toBeDefined()
  })

  it('should return 400 when required fields are missing', async () => {
    const cookie = await createAdminAndGetCookie()

    const response = await request(app)
      .delete('/traits/remove')
      .set('Cookie', cookie)
      .send({})

    expect(response.status).toBe(400)
    expect(response.body.errors).toBeDefined()
  })
})
