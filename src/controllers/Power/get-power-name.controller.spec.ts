import { describe, it, expect, afterEach, afterAll } from 'vitest'
import request from 'supertest'
import app from '../../app'
import { prisma } from '../../config/prisma'

describe('GET /powers/:name (GetPowerNameController)', () => {
  afterEach(async () => {
    await prisma.power.deleteMany()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  async function createPower(name = 'Fire') {
    return prisma.power.create({
      data: {
        name,
        description: 'Fire-based attacks',
        canAwaken: true,
        isAwakened: false,
        pillar: 'BIOLOGICA',
      },
    })
  }

  it('should return 200 with power data when power exists', async () => {
    await createPower('Fire')

    const response = await request(app).get('/powers/Fire')

    expect(response.status).toBe(200)
    expect(response.body).toMatchObject({
      name: 'Fire',
      description: 'Fire-based attacks',
      pillar: 'BIOLOGICA',
      canAwaken: true,
      isAwakened: false,
    })
    expect(response.body.id).toBeDefined()
    expect(response.body.createdAt).toBeDefined()
  })

  it('should return 404 when power does not exist', async () => {
    const response = await request(app).get('/powers/NonExistent')

    expect(response.status).toBe(404)
    expect(response.body.message).toBeDefined()
  })
})
