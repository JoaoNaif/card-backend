import { describe, it, expect, beforeEach } from 'vitest'
import { ResourceAlreadyExistError } from '../../core/error/err/resource-already-exist-error'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'
import { UnauthorizedError } from '../../core/error/err/unauthorized-error'
import { UserRole } from '../../entities/user'
import { InMemoryCharacterRepository } from '../../repositories/test/in-memory-character-repository'
import { InMemoryMachineMemberRepository } from '../../repositories/test/in-memory-machine-member-repository'
import { InMemoryMachineRepository } from '../../repositories/test/in-memory-machine-repository'
import { InMemoryUserRepository } from '../../repositories/test/in-memory-user-repository'
import { makeCharacter } from '../../repositories/test/factories/make-character'
import { makeUser } from '../../repositories/test/factories/make-user'
import { CreateMachineUseCase } from './create-machine'
import { InvalidTeamCompositionError } from './err/invalid-team-composition-error'

let machineRepository: InMemoryMachineRepository
let machineMemberRepository: InMemoryMachineMemberRepository
let characterRepository: InMemoryCharacterRepository
let userRepository: InMemoryUserRepository
let sut: CreateMachineUseCase

describe('CreateMachineUseCase', () => {
  beforeEach(() => {
    machineRepository = new InMemoryMachineRepository()
    machineMemberRepository = new InMemoryMachineMemberRepository()
    characterRepository = new InMemoryCharacterRepository()
    userRepository = new InMemoryUserRepository()
    sut = new CreateMachineUseCase(
      machineRepository,
      machineMemberRepository,
      characterRepository,
      userRepository
    )
  })

  it('should create a machine successfully', async () => {
    const admin = makeUser({ userRole: UserRole.ADMIN })
    await userRepository.create(admin)

    const char1 = makeCharacter()
    const char2 = makeCharacter()
    await characterRepository.create(char1)
    await characterRepository.create(char2)

    const result = await sut.execute({
      userId: admin.id.toString(),
      label: 'M1',
      name: 'Sentinelas de Treino',
      members: [
        { characterId: char1.id.toString(), positionRow: 0, positionCol: 0 },
        { characterId: char2.id.toString(), positionRow: 0, positionCol: 1 },
      ],
    })

    expect(result.isRight()).toBe(true)
    expect(machineRepository.items).toHaveLength(1)
    expect(machineMemberRepository.items).toHaveLength(2)

    if (result.isRight()) {
      expect(result.value.machine.label).toBe('M1')
      expect(result.value.machine.name).toBe('Sentinelas de Treino')
      expect(result.value.machine.members).toHaveLength(2)
    }
  })

  it('should return an error when user is not found', async () => {
    const char1 = makeCharacter()
    await characterRepository.create(char1)

    const result = await sut.execute({
      userId: 'non-existing-user-id',
      label: 'M1',
      name: 'Sentinelas de Treino',
      members: [
        { characterId: char1.id.toString(), positionRow: 0, positionCol: 0 },
      ],
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should return an error when user is not an admin', async () => {
    const user = makeUser({ userRole: UserRole.USER })
    await userRepository.create(user)

    const char1 = makeCharacter()
    await characterRepository.create(char1)

    const result = await sut.execute({
      userId: user.id.toString(),
      label: 'M1',
      name: 'Sentinelas de Treino',
      members: [
        { characterId: char1.id.toString(), positionRow: 0, positionCol: 0 },
      ],
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(UnauthorizedError)
    expect(machineRepository.items).toHaveLength(0)
  })

  it('should return an error when the composition is invalid', async () => {
    const admin = makeUser({ userRole: UserRole.ADMIN })
    await userRepository.create(admin)

    const result = await sut.execute({
      userId: admin.id.toString(),
      label: 'M1',
      name: 'Sentinelas de Treino',
      members: [],
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(InvalidTeamCompositionError)
  })

  it('should return an error when the label already exists', async () => {
    const admin = makeUser({ userRole: UserRole.ADMIN })
    await userRepository.create(admin)

    const char1 = makeCharacter()
    const char2 = makeCharacter()
    await characterRepository.create(char1)
    await characterRepository.create(char2)

    await sut.execute({
      userId: admin.id.toString(),
      label: 'M1',
      name: 'Sentinelas de Treino',
      members: [
        { characterId: char1.id.toString(), positionRow: 0, positionCol: 0 },
      ],
    })

    const result = await sut.execute({
      userId: admin.id.toString(),
      label: 'M1',
      name: 'Outro Nome',
      members: [
        { characterId: char2.id.toString(), positionRow: 0, positionCol: 0 },
      ],
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceAlreadyExistError)
  })

  it('should return an error when a character does not exist', async () => {
    const admin = makeUser({ userRole: UserRole.ADMIN })
    await userRepository.create(admin)

    const result = await sut.execute({
      userId: admin.id.toString(),
      label: 'M1',
      name: 'Sentinelas de Treino',
      members: [
        { characterId: 'non-existing-character', positionRow: 0, positionCol: 0 },
      ],
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
