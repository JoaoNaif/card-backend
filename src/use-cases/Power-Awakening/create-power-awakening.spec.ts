import { describe, it, expect, beforeEach } from 'vitest'
import { InMemoryUserRepository } from '../../repositories/test/in-memory-user-repository'
import { makeUser } from '../../repositories/test/factories/make-user'
import { UserRole } from '../../entities/user'
import { UnauthorizedError } from '../../core/error/err/unauthorized-error'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'
import { ResourceAlreadyExistError } from '../../core/error/err/resource-already-exist-error'
import { InMemoryPowerAwakeningRepository } from '../../repositories/test/in-memory-power-awakening-repository'
import { InMemoryPowerRepository } from '../../repositories/test/in-memory-power-repository'
import { PowerAwakeningUseCase } from './create-power-awakening'
import { makePower } from '../../repositories/test/factories/make-power'
import { PowerIsNotAwakeningError } from './err/power-is-not-awakening-error'
import { PowerWithoutAwakeningError } from './err/power-without-awakening-error'

let userRepository: InMemoryUserRepository
let powerAwakeningRepository: InMemoryPowerAwakeningRepository
let powerRepository: InMemoryPowerRepository
let sut: PowerAwakeningUseCase

describe('PowerAwakeningUseCase', () => {
  beforeEach(() => {
    userRepository = new InMemoryUserRepository()
    powerAwakeningRepository = new InMemoryPowerAwakeningRepository()
    powerRepository = new InMemoryPowerRepository()
    sut = new PowerAwakeningUseCase(
      powerAwakeningRepository,
      powerRepository,
      userRepository
    )
  })

  it('should create a power awakening successfully', async () => {
    const user = makeUser({ userRole: UserRole.ADMIN })

    await userRepository.create(user)

    const awakenedPower = makePower({
      isAwakened: true,
    })

    await powerRepository.create(awakenedPower)

    const basePower = makePower({
      canAwaken: true,
    })

    await powerRepository.create(basePower)

    const result = await sut.execute({
      userId: user.id.toString(),
      basePowerId: basePower.id.toString(),
      awakenedPowerId: awakenedPower.id.toString(),
    })

    expect(result.isRight()).toBe(true)
    expect(userRepository.items).toHaveLength(1)

    if (result.isRight()) {
      expect(result.value.powerAwakening.awakenedPowerId).toBe(
        awakenedPower.id.toString()
      )
      expect(result.value.powerAwakening.basePowerId).toBe(
        basePower.id.toString()
      )
    }
  })

  it('should return an error when user is not an admin', async () => {
    const user = makeUser({ userRole: UserRole.USER })

    await userRepository.create(user)

    const awakenedPower = makePower({
      isAwakened: true,
    })

    await powerRepository.create(awakenedPower)

    const basePower = makePower({
      canAwaken: true,
    })

    await powerRepository.create(basePower)

    const result = await sut.execute({
      userId: user.id.toString(),
      basePowerId: basePower.id.toString(),
      awakenedPowerId: awakenedPower.id.toString(),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(UnauthorizedError)
  })

  it('should return an error when user is not found', async () => {
    const awakenedPower = makePower({
      isAwakened: true,
    })

    await powerRepository.create(awakenedPower)

    const basePower = makePower({
      canAwaken: true,
    })

    await powerRepository.create(basePower)

    const result = await sut.execute({
      userId: 'non-existing-user-id',
      basePowerId: basePower.id.toString(),
      awakenedPowerId: awakenedPower.id.toString(),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should return an error when base power is not found', async () => {
    const user = makeUser({ userRole: UserRole.ADMIN })

    await userRepository.create(user)

    const awakenedPower = makePower({
      isAwakened: true,
    })

    await powerRepository.create(awakenedPower)

    const result = await sut.execute({
      userId: user.id.toString(),
      basePowerId: 'non-existing-base-id',
      awakenedPowerId: awakenedPower.id.toString(),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should return an error when awake power is not found', async () => {
    const user = makeUser({ userRole: UserRole.ADMIN })

    await userRepository.create(user)

    const basePower = makePower({
      canAwaken: true,
    })

    await powerRepository.create(basePower)

    const result = await sut.execute({
      userId: user.id.toString(),
      basePowerId: basePower.id.toString(),
      awakenedPowerId: 'non-existing-awake-id',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should return an error when awake power is not awakening', async () => {
    const user = makeUser({ userRole: UserRole.ADMIN })

    await userRepository.create(user)

    const awakenedPower = makePower({
      isAwakened: false,
    })

    await powerRepository.create(awakenedPower)

    const basePower = makePower({
      canAwaken: true,
    })

    await powerRepository.create(basePower)

    const result = await sut.execute({
      userId: user.id.toString(),
      basePowerId: basePower.id.toString(),
      awakenedPowerId: awakenedPower.id.toString(),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(PowerIsNotAwakeningError)
  })

  it('should return an error when base power without awakening', async () => {
    const user = makeUser({ userRole: UserRole.ADMIN })

    await userRepository.create(user)

    const awakenedPower = makePower({
      isAwakened: true,
    })

    await powerRepository.create(awakenedPower)

    const basePower = makePower({
      canAwaken: false,
    })

    await powerRepository.create(basePower)

    const result = await sut.execute({
      userId: user.id.toString(),
      basePowerId: basePower.id.toString(),
      awakenedPowerId: awakenedPower.id.toString(),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(PowerWithoutAwakeningError)
  })

  it('should return an error when the awakening pair already exists', async () => {
    const user = makeUser({ userRole: UserRole.ADMIN })

    await userRepository.create(user)

    const awakenedPower = makePower({ isAwakened: true })
    const basePower = makePower({ canAwaken: true })

    await powerRepository.create(awakenedPower)
    await powerRepository.create(basePower)

    const request = {
      userId: user.id.toString(),
      basePowerId: basePower.id.toString(),
      awakenedPowerId: awakenedPower.id.toString(),
    }

    await sut.execute(request)
    const result = await sut.execute(request)

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceAlreadyExistError)
  })
})
