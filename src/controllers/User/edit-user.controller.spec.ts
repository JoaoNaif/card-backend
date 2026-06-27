import { describe, it, expect, afterEach, afterAll } from 'vitest'
import request from 'supertest'
import app from '../../app'
import { prisma } from '../../config/prisma'

describe('PUT /users/update (EditUserController)', () => {
  afterEach(async () => {
    await prisma.user.deleteMany()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  async function createAndAuthenticate(
    name = 'John Doe',
    email = 'john@example.com',
    password = '123456',
  ) {
    await request(app).post('/users').send({ name, email, password })

    const authResponse = await request(app)
      .post('/users/authenticate')
      .send({ email, password })

    return authResponse.headers['set-cookie'] as unknown as string[]
  }

  it('should return 204 when updating name', async () => {
    const cookie = await createAndAuthenticate()

    const response = await request(app)
      .put('/users/update')
      .set('Cookie', cookie)
      .send({ name: 'Jane Doe' })

    expect(response.status).toBe(204)
  })

  it('should return 204 when updating email', async () => {
    const cookie = await createAndAuthenticate()

    const response = await request(app)
      .put('/users/update')
      .set('Cookie', cookie)
      .send({ email: 'jane@example.com' })

    expect(response.status).toBe(204)
  })

  it('should return 204 when updating both name and email', async () => {
    const cookie = await createAndAuthenticate()

    const response = await request(app)
      .put('/users/update')
      .set('Cookie', cookie)
      .send({ name: 'Jane Doe', email: 'jane@example.com' })

    expect(response.status).toBe(204)
  })

  it('should return 400 when email is already in use by another user', async () => {
    await request(app)
      .post('/users')
      .send({ name: 'Other User', email: 'other@example.com', password: '123456' })

    const cookie = await createAndAuthenticate()

    const response = await request(app)
      .put('/users/update')
      .set('Cookie', cookie)
      .send({ email: 'other@example.com' })

    expect(response.status).toBe(400)
    expect(response.body.message).toBeDefined()
  })

  it('should return 401 when not authenticated', async () => {
    const response = await request(app)
      .put('/users/update')
      .send({ name: 'Jane Doe' })

    expect(response.status).toBe(401)
  })
})
