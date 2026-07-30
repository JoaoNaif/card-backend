import { describe, it, expect, beforeEach } from 'vitest'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'
import { Machine } from '../../entities/machine'
import { MachineMember } from '../../entities/machine-member'
import { InMemoryMachineMemberRepository } from '../../repositories/test/in-memory-machine-member-repository'
import { InMemoryMachineRepository } from '../../repositories/test/in-memory-machine-repository'
import { GetMachineTeamUseCase } from './get-machine-team'

let machineRepository: InMemoryMachineRepository
let machineMemberRepository: InMemoryMachineMemberRepository
let sut: GetMachineTeamUseCase

describe('GetMachineTeamUseCase', () => {
  beforeEach(() => {
    machineRepository = new InMemoryMachineRepository()
    machineMemberRepository = new InMemoryMachineMemberRepository()
    sut = new GetMachineTeamUseCase(machineRepository, machineMemberRepository)
  })

  it('should return the machine team by label', async () => {
    const machine = Machine.create({ label: 'M1', name: 'Sentinelas de Treino' })
    await machineRepository.create(machine)

    const member1 = MachineMember.create({
      machineId: machine.id.toString(),
      characterId: 'char-1',
      positionRow: 0,
      positionCol: 0,
    })
    const member2 = MachineMember.create({
      machineId: machine.id.toString(),
      characterId: 'char-2',
      positionRow: 0,
      positionCol: 1,
    })
    await machineMemberRepository.create(member1)
    await machineMemberRepository.create(member2)

    const result = await sut.execute({ machineId: 'M1' })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.machine.label).toBe('M1')
      expect(result.value.machine.name).toBe('Sentinelas de Treino')
      expect(result.value.machine.members).toHaveLength(2)
      expect(result.value.machine.members).toEqual(
        expect.arrayContaining([
          { characterId: 'char-1', positionRow: 0, positionCol: 0 },
          { characterId: 'char-2', positionRow: 0, positionCol: 1 },
        ])
      )
    }
  })

  it('should return the machine team by id', async () => {
    const machine = Machine.create({ label: 'M1', name: 'Sentinelas de Treino' })
    await machineRepository.create(machine)

    const result = await sut.execute({ machineId: machine.id.toString() })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.machine.id).toBe(machine.id.toString())
      expect(result.value.machine.label).toBe('M1')
    }
  })

  it('should return an error when the machine does not exist', async () => {
    const result = await sut.execute({ machineId: 'M2' })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
