import { describe, it, expect, beforeEach } from 'vitest'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'
import { InMemoryPowerRepository } from '../../repositories/test/in-memory-power-repository'
import { makePower } from '../../repositories/test/factories/make-power'
import { Pillar } from '../../entities/power'
import { GetPowerNameUseCase } from './get-power-name'

let powerRepository: InMemoryPowerRepository
let sut: GetPowerNameUseCase

describe('GetPowerNameUseCase', () => {
  beforeEach(() => {
    powerRepository = new InMemoryPowerRepository()
    sut = new GetPowerNameUseCase(powerRepository)
  })

  it('should edit a user successfully', async () => {
    const power = makePower({
      name: 'Gelo',
      description: 'Manipula a temperatura, esfriando ela',
      pillar: Pillar.MATERIAL,
    })

    await powerRepository.create(power)

    const result = await sut.execute({
      name: power.name,
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(result.value.power.name).toBe('Gelo')
      expect(result.value.power.description).toBe(
        'Manipula a temperatura, esfriando ela'
      )
    }
  })

  it('should return an error when power not found', async () => {
    const result = await sut.execute({
      name: 'Gelo Negro',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
