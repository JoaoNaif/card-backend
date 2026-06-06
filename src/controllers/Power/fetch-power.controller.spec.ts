import { describe, it, expect, afterEach, afterAll } from 'vitest'
import request from 'supertest'
import app from '../../app'
import { prisma } from '../../config/prisma'

describe('GET /powers (FetchPowerController)', () => {
  afterEach(async () => {
    await prisma.power.deleteMany()
    await prisma.user.deleteMany()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  it('should return 200 with an empty list when no powers exist', async () => {
    const response = await request(app).get('/powers')

    expect(response.status).toBe(200)
    expect(response.body).toEqual([])
  })

  it('should return 200 with a list of powers', async () => {
    await prisma.power.createMany({
      data: [
        { name: 'Fire', description: 'Fire-based attacks' },
        { name: 'Ice', description: 'Ice-based attacks' },
      ],
    })

    const response = await request(app).get('/powers')

    expect(response.status).toBe(200)
    expect(response.body).toHaveLength(2)
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Fire', description: 'Fire-based attacks' }),
        expect.objectContaining({ name: 'Ice', description: 'Ice-based attacks' }),
      ])
    )
  })

  it('each power should have id, name, description and createdAt fields', async () => {
    await prisma.power.create({ data: { name: 'Fire', description: 'Fire-based attacks' } })

    const response = await request(app).get('/powers')

    expect(response.status).toBe(200)
    expect(response.body[0]).toMatchObject({
      id: expect.any(String),
      name: 'Fire',
      description: 'Fire-based attacks',
      createdAt: expect.any(String),
    })
  })

  it('should filter powers by search query', async () => {
    await prisma.power.createMany({
      data: [
        { name: 'Fire', description: 'Fire-based attacks' },
        { name: 'Ice', description: 'Ice-based attacks' },
      ],
    })

    const response = await request(app).get('/powers?search=Fire')

    expect(response.status).toBe(200)
    expect(response.body).toHaveLength(1)
    expect(response.body[0]).toMatchObject({ name: 'Fire' })
  })

  it('should paginate powers with page and limit params', async () => {
    await prisma.power.createMany({
      data: Array.from({ length: 15 }, (_, i) => ({
        name: `Power ${i + 1}`,
        description: `Description ${i + 1}`,
      })),
    })

    const page1 = await request(app).get('/powers?page=1&limit=10')

    expect(page1.status).toBe(200)
    expect(page1.body).toHaveLength(10)

    const page2 = await request(app).get('/powers?page=2&limit=10')

    expect(page2.status).toBe(200)
    expect(page2.body).toHaveLength(5)
  })

  it('should not require authentication', async () => {
    const response = await request(app).get('/powers')

    expect(response.status).toBe(200)
  })
})
