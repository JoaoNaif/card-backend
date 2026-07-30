import { describe, it, expect, beforeEach } from 'vitest'
import { Machine } from '../../entities/machine'
import { MachineMember } from '../../entities/machine-member'
import { InMemoryMachineMemberRepository } from '../../repositories/test/in-memory-machine-member-repository'
import { InMemoryMachineRepository } from '../../repositories/test/in-memory-machine-repository'
import { FetchMachinesUseCase } from './fetch-machines'

let machineRepository: InMemoryMachineRepository
let machineMemberRepository: InMemoryMachineMemberRepository
let sut: FetchMachinesUseCase

describe('FetchMachinesUseCase', () => {
  beforeEach(() => {
    machineRepository = new InMemoryMachineRepository()
    machineMemberRepository = new InMemoryMachineMemberRepository()
    sut = new FetchMachinesUseCase(machineRepository, machineMemberRepository)
  })

  it('should return an empty list when there are no machines', async () => {
    const result = await sut.execute()

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.machines).toEqual([])
    }
  })

  it('should return all machines with their members', async () => {
    const machine1 = Machine.create({ label: 'M1', name: 'Sentinelas de Treino' })
    const machine2 = Machine.create({ label: 'M2', name: 'Guardiões Avançados' })
    await machineRepository.create(machine1)
    await machineRepository.create(machine2)

    const member1 = MachineMember.create({
      machineId: machine1.id.toString(),
      characterId: 'char-1',
      positionRow: 0,
      positionCol: 0,
    })
    await machineMemberRepository.create(member1)

    const result = await sut.execute()

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.machines).toHaveLength(2)

      const dtoMachine1 = result.value.machines.find((m) => m.label === 'M1')
      expect(dtoMachine1).toMatchObject({
        id: machine1.id.toString(),
        label: 'M1',
        name: 'Sentinelas de Treino',
        members: [{ characterId: 'char-1', positionRow: 0, positionCol: 0 }],
      })

      const dtoMachine2 = result.value.machines.find((m) => m.label === 'M2')
      expect(dtoMachine2).toMatchObject({
        id: machine2.id.toString(),
        label: 'M2',
        name: 'Guardiões Avançados',
        members: [],
      })
    }
  })
})
