import { describe, it, expect, beforeEach } from 'vitest'
import { InMemorySkillRepository } from '../../repositories/test/in-memory-skill-repository'
import { makeSkill } from '../../repositories/test/factories/make-skill'
import { InMemoryPowerRepository } from '../../repositories/test/in-memory-power-repository'
import { GetSkillUseCase } from './get-skill'
import { makePower } from '../../repositories/test/factories/make-power'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'
import { InMemoryBattleFieldRepository } from '../../repositories/test/in-memory-battle-field-repository'
import { makeBattleField } from '../../repositories/test/factories/make-battle-field'

let skillRepository: InMemorySkillRepository
let powerRepository: InMemoryPowerRepository
let battleFieldRepository: InMemoryBattleFieldRepository
let sut: GetSkillUseCase

describe('GetSkillUseCase', () => {
  beforeEach(() => {
    skillRepository = new InMemorySkillRepository()
    powerRepository = new InMemoryPowerRepository()
    battleFieldRepository = new InMemoryBattleFieldRepository()
    sut = new GetSkillUseCase(
      skillRepository,
      powerRepository,
      battleFieldRepository
    )
  })

  it('should get a skill successfully', async () => {
    const power = makePower({
      name: 'Power 1',
    })

    await powerRepository.create(power)

    const battleField = makeBattleField()

    await battleFieldRepository.create(battleField)

    const skill = makeSkill({
      name: 'Skill 1',
      powerId: power.id.toString(),
      appliesBattleFieldId: battleField.id.toString(),
      fieldDuration: 3,
    })

    await skillRepository.create(skill)

    const result = await sut.execute({
      skillId: skill.id.toString(),
    })

    expect(result.isRight()).toBe(true)
    expect(skillRepository.items).toHaveLength(1)

    if (result.isRight()) {
      expect(result.value.skill.name).toBe('Skill 1')
      expect(result.value.skill.power.name).toBe('Power 1')
    }
  })

  it('should get a skill with battle field successfully', async () => {
    const power = makePower({
      name: 'Power 1',
    })

    await powerRepository.create(power)

    const battleField = makeBattleField({
      name: 'Lagoa azul',
    })

    await battleFieldRepository.create(battleField)

    const skill = makeSkill({
      name: 'Skill 1',
      powerId: power.id.toString(),
      appliesBattleFieldId: battleField.id.toString(),
      fieldDuration: 3,
    })

    await skillRepository.create(skill)

    const result = await sut.execute({
      skillId: skill.id.toString(),
    })

    expect(result.isRight()).toBe(true)
    expect(skillRepository.items).toHaveLength(1)

    if (result.isRight()) {
      expect(result.value.skill.battleField?.name).toBe('Lagoa azul')
      expect(result.value.skill.fieldDuration).toBe(3)
    }
  })

  it('should return an error when power is not found', async () => {
    const skill = makeSkill({
      name: 'Skill 1',
    })

    await skillRepository.create(skill)

    const result = await sut.execute({
      skillId: skill.id.toString(),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
