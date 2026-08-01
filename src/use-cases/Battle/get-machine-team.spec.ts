import { describe, it, expect, beforeEach } from 'vitest'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'
import { Machine } from '../../entities/machine'
import { MachineMember } from '../../entities/machine-member'
import { InMemoryMachineMemberRepository } from '../../repositories/test/in-memory-machine-member-repository'
import { InMemoryMachineRepository } from '../../repositories/test/in-memory-machine-repository'
import { InMemoryCharacterRepository } from '../../repositories/test/in-memory-character-repository'
import { InMemoryPowerRepository } from '../../repositories/test/in-memory-power-repository'
import { InMemoryCharacterSkillRepository } from '../../repositories/test/in-memory-character-skill-repository'
import { InMemorySkillRepository } from '../../repositories/test/in-memory-skill-repository'
import { InMemoryBattleFieldRepository } from '../../repositories/test/in-memory-battle-field-repository'
import { makeCharacter } from '../../repositories/test/factories/make-character'
import { makePower } from '../../repositories/test/factories/make-power'
import { GetCharacterUseCase } from '../Character/get-character'
import { GetMachineTeamUseCase } from './get-machine-team'

let machineRepository: InMemoryMachineRepository
let machineMemberRepository: InMemoryMachineMemberRepository
let characterRepository: InMemoryCharacterRepository
let powerRepository: InMemoryPowerRepository
let characterSkillRepository: InMemoryCharacterSkillRepository
let skillRepository: InMemorySkillRepository
let battleFieldRepository: InMemoryBattleFieldRepository
let getCharacterUseCase: GetCharacterUseCase
let sut: GetMachineTeamUseCase

describe('GetMachineTeamUseCase', () => {
  beforeEach(() => {
    machineRepository = new InMemoryMachineRepository()
    machineMemberRepository = new InMemoryMachineMemberRepository()
    characterRepository = new InMemoryCharacterRepository()
    powerRepository = new InMemoryPowerRepository()
    characterSkillRepository = new InMemoryCharacterSkillRepository()
    skillRepository = new InMemorySkillRepository()
    battleFieldRepository = new InMemoryBattleFieldRepository()
    getCharacterUseCase = new GetCharacterUseCase(
      characterRepository,
      powerRepository,
      characterSkillRepository,
      skillRepository,
      battleFieldRepository
    )
    sut = new GetMachineTeamUseCase(
      machineRepository,
      machineMemberRepository,
      getCharacterUseCase
    )
  })

  it('should return the machine team by label with full character info', async () => {
    const power = makePower({ name: 'Piroquinese' })
    await powerRepository.create(power)

    const character1 = makeCharacter({
      name: 'Ignis',
      powerId: power.id.toString(),
    })
    const character2 = makeCharacter({
      name: 'Vulcana',
      powerId: power.id.toString(),
    })
    await characterRepository.create(character1)
    await characterRepository.create(character2)

    const machine = Machine.create({ label: 'M1', name: 'Sentinelas de Treino' })
    await machineRepository.create(machine)

    const member1 = MachineMember.create({
      machineId: machine.id.toString(),
      characterId: character1.id.toString(),
      positionRow: 0,
      positionCol: 0,
    })
    const member2 = MachineMember.create({
      machineId: machine.id.toString(),
      characterId: character2.id.toString(),
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

      const member = result.value.machine.members.find(
        (m) => m.characterId === character1.id.toString()
      )
      expect(member?.character.name).toBe('Ignis')
      expect(member?.character.power.id).toBe(power.id.toString())
      expect(member?.character.skills).toEqual([])
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

  it('should return an error when a member character does not exist', async () => {
    const machine = Machine.create({ label: 'M1', name: 'Sentinelas de Treino' })
    await machineRepository.create(machine)

    const member = MachineMember.create({
      machineId: machine.id.toString(),
      characterId: 'non-existent-character',
      positionRow: 0,
      positionCol: 0,
    })
    await machineMemberRepository.create(member)

    const result = await sut.execute({ machineId: 'M1' })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
