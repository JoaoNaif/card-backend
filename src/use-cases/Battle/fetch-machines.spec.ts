import { describe, it, expect, beforeEach } from 'vitest'
import { Machine } from '../../entities/machine'
import { MachineMember } from '../../entities/machine-member'
import { InMemoryMachineMemberRepository } from '../../repositories/test/in-memory-machine-member-repository'
import { InMemoryMachineRepository } from '../../repositories/test/in-memory-machine-repository'
import { InMemoryCharacterRepository } from '../../repositories/test/in-memory-character-repository'
import { InMemoryPowerRepository } from '../../repositories/test/in-memory-power-repository'
import { makeCharacter } from '../../repositories/test/factories/make-character'
import { makePower } from '../../repositories/test/factories/make-power'
import { FetchMachinesUseCase } from './fetch-machines'

let machineRepository: InMemoryMachineRepository
let machineMemberRepository: InMemoryMachineMemberRepository
let characterRepository: InMemoryCharacterRepository
let powerRepository: InMemoryPowerRepository
let sut: FetchMachinesUseCase

describe('FetchMachinesUseCase', () => {
  beforeEach(() => {
    machineRepository = new InMemoryMachineRepository()
    machineMemberRepository = new InMemoryMachineMemberRepository()
    characterRepository = new InMemoryCharacterRepository()
    powerRepository = new InMemoryPowerRepository()
    sut = new FetchMachinesUseCase(
      machineRepository,
      machineMemberRepository,
      characterRepository,
      powerRepository
    )
  })

  it('should return an empty list when there are no machines', async () => {
    const result = await sut.execute()

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.machines).toEqual([])
    }
  })

  it('should return all machines with a summarized character for each member', async () => {
    const power = makePower({ name: 'Piroquinese' })
    await powerRepository.create(power)

    const character1 = makeCharacter({
      name: 'Ignis',
      powerId: power.id.toString(),
    })
    await characterRepository.create(character1)

    const machine1 = Machine.create({ label: 'M1', name: 'Sentinelas de Treino' })
    const machine2 = Machine.create({ label: 'M2', name: 'Guardiões Avançados' })
    await machineRepository.create(machine1)
    await machineRepository.create(machine2)

    const member1 = MachineMember.create({
      machineId: machine1.id.toString(),
      characterId: character1.id.toString(),
      positionRow: 0,
      positionCol: 0,
    })
    await machineMemberRepository.create(member1)

    const result = await sut.execute()

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.machines).toHaveLength(2)

      const dtoMachine1 = result.value.machines.find((m) => m.label === 'M1')
      expect(dtoMachine1?.members).toHaveLength(1)
      expect(dtoMachine1?.members[0]).toMatchObject({
        characterId: character1.id.toString(),
        positionRow: 0,
        positionCol: 0,
        character: {
          id: character1.id.toString(),
          name: 'Ignis',
          power: { id: power.id.toString(), name: 'Piroquinese' },
        },
      })

      const dtoMachine2 = result.value.machines.find((m) => m.label === 'M2')
      expect(dtoMachine2?.members).toEqual([])
    }
  })

  it('should return ResourceNotFoundError when a member character does not exist', async () => {
    const machine = Machine.create({ label: 'M1', name: 'Sentinelas de Treino' })
    await machineRepository.create(machine)

    const member = MachineMember.create({
      machineId: machine.id.toString(),
      characterId: 'non-existent-character',
      positionRow: 0,
      positionCol: 0,
    })
    await machineMemberRepository.create(member)

    const result = await sut.execute()

    expect(result.isLeft()).toBe(true)
  })
})
