import { describe, it, expect, beforeEach } from 'vitest'
import { InMemorySkillRepository } from '../../repositories/test/in-memory-skill-repository'
import { makeSkill } from '../../repositories/test/factories/make-skill'
import { InMemoryPowerRepository } from '../../repositories/test/in-memory-power-repository'
import { GetSkillUseCase } from './get-skill'
import { makePower } from '../../repositories/test/factories/make-power'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'

let skillRepository: InMemorySkillRepository
let powerRepository: InMemoryPowerRepository
let sut: GetSkillUseCase

describe('GetSkillUseCase', () => {
  beforeEach(() => {
    skillRepository = new InMemorySkillRepository()
    powerRepository = new InMemoryPowerRepository()
    sut = new GetSkillUseCase(skillRepository, powerRepository)
  })

  it('should get a skill successfully', async () => {
    const power = makePower({
      name: 'Power 1',
    })

    await powerRepository.create(power)

    const skill = makeSkill({
      name: 'Skill 1',
      powerId: power.id.toString(),
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
