import { describe, it, expect, afterEach, afterAll } from 'vitest'
import request from 'supertest'
import app from '../../app'
import { prisma } from '../../config/prisma'

describe('POST /users (CreateUserController)', () => {
  afterEach(async () => {
    await prisma.user.deleteMany()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  it('should create a user and return 201 with user data', async () => {
    const response = await request(app)
      .post('/users')
      .send({ name: 'John Doe', email: 'john@example.com', password: '123456' })

    expect(response.status).toBe(201)
    expect(response.body).toMatchObject({
      name: 'John Doe',
      email: 'john@example.com',
    })
    expect(response.body.id).toBeDefined()
    expect(response.body.createdAt).toBeDefined()

    const cookies = response.headers['set-cookie'] as unknown as string[]
    expect(cookies).toBeDefined()
    expect(cookies.some((c) => c.startsWith('token='))).toBe(true)
    expect(cookies.some((c) => c.includes('HttpOnly'))).toBe(true)
  })

  it('should return 409 when email is already in use', async () => {
    await request(app)
      .post('/users')
      .send({ name: 'John Doe', email: 'john@example.com', password: '123456' })

    const response = await request(app)
      .post('/users')
      .send({ name: 'Other User', email: 'john@example.com', password: '123456' })

    expect(response.status).toBe(409)
    expect(response.body.message).toBeDefined()
  })

  it('should return 400 when required fields are missing', async () => {
    const response = await request(app)
      .post('/users')
      .send({ name: 'John Doe' })

    expect(response.status).toBe(400)
    expect(response.body.errors.email).toBeDefined()
  })

  it('should return 400 when email format is invalid', async () => {
    const response = await request(app)
      .post('/users')
      .send({ name: 'John Doe', email: 'not-an-email', password: '123456' })

    expect(response.status).toBe(400)
    expect(response.body.errors.email).toBeDefined()
  })
})
