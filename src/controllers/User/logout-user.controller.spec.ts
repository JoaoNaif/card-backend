import { describe, it, expect, afterEach, afterAll } from 'vitest'
import request from 'supertest'
import app from '../../app'
import { prisma } from '../../config/prisma'

describe('POST /users/logout (LogoutUserController)', () => {
  afterEach(async () => {
    await prisma.user.deleteMany()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  async function createAndAuthenticate() {
    await request(app)
      .post('/users')
      .send({ name: 'John Doe', email: 'john@example.com', password: '123456' })

    const authResponse = await request(app)
      .post('/users/authenticate')
      .send({ email: 'john@example.com', password: '123456' })

    return authResponse.headers['set-cookie'] as unknown as string[]
  }

  it('should return 200 and clear the token cookie', async () => {
    const cookie = await createAndAuthenticate()

    const response = await request(app)
      .post('/users/logout')
      .set('Cookie', cookie)

    expect(response.status).toBe(200)

    const setCookie = response.headers['set-cookie'] as unknown as string[]
    expect(setCookie).toBeDefined()
    const tokenCookie = setCookie.find((c) => c.startsWith('token='))
    expect(tokenCookie).toBeDefined()
    expect(tokenCookie).toMatch(/token=;/)
    expect(tokenCookie).toMatch(/Expires=Thu, 01 Jan 1970/)
  })

  it('should invalidate access to protected routes after logout', async () => {
    const cookie = await createAndAuthenticate()

    const logoutResponse = await request(app)
      .post('/users/logout')
      .set('Cookie', cookie)

    const clearedCookie = logoutResponse.headers['set-cookie'] as unknown as string[]

    const meResponse = await request(app)
      .get('/users/me')
      .set('Cookie', clearedCookie)

    expect(meResponse.status).toBe(401)
  })

  it('should return 200 even when not authenticated', async () => {
    const response = await request(app).post('/users/logout')

    expect(response.status).toBe(200)
  })
})
