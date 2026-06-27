import { describe, it, expect, afterEach, afterAll } from 'vitest'
import request from 'supertest'
import app from '../../app'
import { prisma } from '../../config/prisma'

describe('DELETE /users/remove (RemoveUserController)', () => {
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

  it('should return 204 and delete the authenticated user', async () => {
    const cookie = await createAndAuthenticate()

    const response = await request(app)
      .delete('/users/remove')
      .set('Cookie', cookie)

    expect(response.status).toBe(204)

    const user = await prisma.user.findUnique({
      where: { email: 'john@example.com' },
    })
    expect(user).toBeNull()
  })

  it('should return 401 when not authenticated', async () => {
    const response = await request(app).delete('/users/remove')

    expect(response.status).toBe(401)
  })
})
