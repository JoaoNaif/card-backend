import { describe, it, expect, afterEach, afterAll } from 'vitest'
import request from 'supertest'
import app from '../../app'
import { prisma } from '../../config/prisma'

describe('POST /users/authenticate (AuthenticateUserController)', () => {
  afterEach(async () => {
    await prisma.user.deleteMany()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  it('should return 200 and set token cookie on valid credentials', async () => {
    await request(app)
      .post('/users')
      .send({ name: 'John Doe', email: 'john@example.com', password: '123456' })

    const response = await request(app)
      .post('/users/authenticate')
      .send({ email: 'john@example.com', password: '123456' })

    expect(response.status).toBe(200)
    expect(response.body.message).toBe('Authenticated successfully.')

    const cookies = response.headers['set-cookie'] as unknown as string[]
    expect(cookies).toBeDefined()
    expect(cookies.some((c) => c.startsWith('token='))).toBe(true)
    expect(cookies.some((c) => c.includes('HttpOnly'))).toBe(true)
  })

  it('should return 401 when user does not exist', async () => {
    const response = await request(app)
      .post('/users/authenticate')
      .send({ email: 'nonexistent@example.com', password: '123456' })

    expect(response.status).toBe(401)
    expect(response.body.message).toBeDefined()
  })

  it('should return 401 when password is wrong', async () => {
    await request(app)
      .post('/users')
      .send({ name: 'John Doe', email: 'john@example.com', password: '123456' })

    const response = await request(app)
      .post('/users/authenticate')
      .send({ email: 'john@example.com', password: 'wrong-password' })

    expect(response.status).toBe(401)
    expect(response.body.message).toBeDefined()
  })

  it('should return 400 when required fields are missing', async () => {
    const response = await request(app)
      .post('/users/authenticate')
      .send({ email: 'john@example.com' })

    expect(response.status).toBe(400)
    expect(response.body.errors.password).toBeDefined()
  })
})
