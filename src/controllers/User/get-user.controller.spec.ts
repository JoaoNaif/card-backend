import { describe, it, expect, afterEach, afterAll } from 'vitest'
import request from 'supertest'
import app from '../../app'
import { prisma } from '../../config/prisma'

describe('GET /users/:id (GetUserController)', () => {
  afterEach(async () => {
    await prisma.user.deleteMany()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  it('should return 200 with user data', async () => {
    const created = await request(app)
      .post('/users')
      .send({ name: 'John Doe', email: 'john@example.com', password: '123456' })

    const { id } = created.body

    const response = await request(app).get(`/users/${id}`)

    expect(response.status).toBe(200)
    expect(response.body).toMatchObject({
      id,
      name: 'John Doe',
      email: 'john@example.com',
    })
    expect(response.body.createdAt).toBeDefined()
  })

  it('should return 404 when user does not exist', async () => {
    const response = await request(app).get('/users/non-existent-id')

    expect(response.status).toBe(404)
    expect(response.body.message).toBeDefined()
  })
})
