import { describe, it, expect, afterEach, afterAll } from 'vitest'
import request from 'supertest'
import app from '../../app'
import { prisma } from '../../config/prisma'

describe('GET /users/me (GetUserController)', () => {
  afterEach(async () => {
    await prisma.user.deleteMany()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  it('should return 200 with user data when authenticated', async () => {
    await request(app)
      .post('/users')
      .send({ name: 'John Doe', email: 'john@example.com', password: '123456' })

    const authResponse = await request(app)
      .post('/users/authenticate')
      .send({ email: 'john@example.com', password: '123456' })

    const cookie = authResponse.headers['set-cookie'] as unknown as string[]

    const response = await request(app)
      .get('/users/me')
      .set('Cookie', cookie)

    expect(response.status).toBe(200)
    expect(response.body).toMatchObject({
      name: 'John Doe',
      email: 'john@example.com',
    })
    expect(response.body.createdAt).toBeDefined()
    expect(response.body.stats).toEqual({
      rosterCount: 0,
      battlesPlayed: 0,
      wins: 0,
      winRate: 0,
    })
  })

  it('should return 401 when not authenticated', async () => {
    const response = await request(app).get('/users/me')

    expect(response.status).toBe(401)
    expect(response.body.message).toBeDefined()
  })
})
