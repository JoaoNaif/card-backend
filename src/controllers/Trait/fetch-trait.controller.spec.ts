import { describe, it, expect, afterEach, afterAll } from 'vitest'
import request from 'supertest'
import app from '../../app'
import { prisma } from '../../config/prisma'

describe('GET /traits (FetchTraitController)', () => {
  afterEach(async () => {
    await prisma.trait.deleteMany()
    await prisma.user.deleteMany()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  async function createUserAndGetCookie() {
    await request(app)
      .post('/users')
      .send({ name: 'John Doe', email: 'john@example.com', password: '123456' })

    const authResponse = await request(app)
      .post('/users/authenticate')
      .send({ email: 'john@example.com', password: '123456' })

    return authResponse.headers['set-cookie'] as unknown as string[]
  }

  it('should return 200 with an empty list when no traits exist', async () => {
    const cookie = await createUserAndGetCookie()

    const response = await request(app).get('/traits').set('Cookie', cookie)

    expect(response.status).toBe(200)
    expect(response.body).toEqual([])
  })

  it('should return 200 with a list of traits', async () => {
    const cookie = await createUserAndGetCookie()

    await prisma.trait.createMany({
      data: [
        { name: 'Brave', description: 'A brave trait' },
        { name: 'Cunning', description: 'A cunning trait' },
      ],
    })

    const response = await request(app).get('/traits').set('Cookie', cookie)

    expect(response.status).toBe(200)
    expect(response.body).toHaveLength(2)
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Brave', description: 'A brave trait' }),
        expect.objectContaining({ name: 'Cunning', description: 'A cunning trait' }),
      ])
    )
  })

  it('each trait should have id, name, description and createdAt fields', async () => {
    const cookie = await createUserAndGetCookie()

    await prisma.trait.create({ data: { name: 'Brave', description: 'A brave trait' } })

    const response = await request(app).get('/traits').set('Cookie', cookie)

    expect(response.status).toBe(200)
    expect(response.body[0]).toMatchObject({
      id: expect.any(String),
      name: 'Brave',
      description: 'A brave trait',
      createdAt: expect.any(String),
    })
  })

  it('should filter traits by search query', async () => {
    const cookie = await createUserAndGetCookie()

    await prisma.trait.createMany({
      data: [
        { name: 'Brave', description: 'A brave trait' },
        { name: 'Cunning', description: 'A cunning trait' },
      ],
    })

    const response = await request(app)
      .get('/traits?search=Brave')
      .set('Cookie', cookie)

    expect(response.status).toBe(200)
    expect(response.body).toHaveLength(1)
    expect(response.body[0]).toMatchObject({ name: 'Brave' })
  })

  it('should paginate traits with page and limit params', async () => {
    const cookie = await createUserAndGetCookie()

    await prisma.trait.createMany({
      data: Array.from({ length: 15 }, (_, i) => ({
        name: `Trait ${i + 1}`,
        description: `Description ${i + 1}`,
      })),
    })

    const page1 = await request(app)
      .get('/traits?page=1&limit=10')
      .set('Cookie', cookie)

    expect(page1.status).toBe(200)
    expect(page1.body).toHaveLength(10)

    const page2 = await request(app)
      .get('/traits?page=2&limit=10')
      .set('Cookie', cookie)

    expect(page2.status).toBe(200)
    expect(page2.body).toHaveLength(5)
  })

  it('should return 401 when not authenticated', async () => {
    const response = await request(app).get('/traits')

    expect(response.status).toBe(401)
    expect(response.body.message).toBeDefined()
  })
})
