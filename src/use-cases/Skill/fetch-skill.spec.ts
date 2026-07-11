import { describe, it, expect, beforeEach, assert } from 'vitest'
import { InMemorySkillRepository } from '../../repositories/test/in-memory-skill-repository'
import { InMemoryPowerRepository } from '../../repositories/test/in-memory-power-repository'
import { InMemoryBattleFieldRepository } from '../../repositories/test/in-memory-battle-field-repository'
import { FetchSkillUseCase } from './fetch-skill'
import { makeSkill } from '../../repositories/test/factories/make-skill'
import { makePower } from '../../repositories/test/factories/make-power'

let skillRepository: InMemorySkillRepository
let powerRepository: InMemoryPowerRepository
let battleFieldRepository: InMemoryBattleFieldRepository
let sut: FetchSkillUseCase

describe('FetchSkillUseCase', () => {
  beforeEach(() => {
    skillRepository = new InMemorySkillRepository()
    powerRepository = new InMemoryPowerRepository()
    battleFieldRepository = new InMemoryBattleFieldRepository()
    sut = new FetchSkillUseCase(
      skillRepository,
      powerRepository,
      battleFieldRepository
    )
  })

  it('should fetch skills successfully', async () => {
    const power = makePower()
    await powerRepository.create(power)

    await Promise.all(
      Array.from({ length: 3 }).map((_, i) =>
        skillRepository.create(
          makeSkill({ name: `Skill ${i + 1}`, powerId: power.id.toString() })
        )
      )
    )

    const result = await sut.execute({ search: '', page: 1, limit: 10 })

    assert(result.isRight())
    expect(result.value.skills).toHaveLength(3)
    expect(result.value.skills[0]?.power.id).toBe(power.id.toString())
  })

  it('should paginate skills correctly', async () => {
    const power = makePower()
    await powerRepository.create(power)

    await Promise.all(
      Array.from({ length: 5 }).map((_, i) =>
        skillRepository.create(
          makeSkill({ name: `Skill ${i + 1}`, powerId: power.id.toString() })
        )
      )
    )

    const page1 = await sut.execute({ search: '', page: 1, limit: 3 })
    const page2 = await sut.execute({ search: '', page: 2, limit: 3 })

    assert(page1.isRight())
    expect(page1.value.skills).toHaveLength(3)

    assert(page2.isRight())
    expect(page2.value.skills).toHaveLength(2)
  })

  it('should return ResourceNotFoundError when power is not found', async () => {
    await skillRepository.create(makeSkill({ name: 'Skill 1' }))

    const result = await sut.execute({ search: '', page: 1, limit: 10 })

    expect(result.isLeft()).toBe(true)
  })
})
