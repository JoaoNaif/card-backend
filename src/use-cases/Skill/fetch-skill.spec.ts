import { describe, it, expect, beforeEach, assert } from 'vitest'
import { InMemorySkillRepository } from '../../repositories/test/in-memory-skill-repository'
import { FetchSkillUseCase } from './fetch-skill'
import { makeSkill } from '../../repositories/test/factories/make-skill'

let skillRepository: InMemorySkillRepository
let sut: FetchSkillUseCase

describe('FetchSkillUseCase', () => {
  beforeEach(() => {
    skillRepository = new InMemorySkillRepository()
    sut = new FetchSkillUseCase(skillRepository)
  })

  it('should fetch skills successfully', async () => {
    await Promise.all(
      Array.from({ length: 3 }).map((_, i) =>
        skillRepository.create(makeSkill({ name: `Skill ${i + 1}` }))
      )
    )

    const result = await sut.execute({ search: '', page: 1, limit: 10 })

    assert(result.isRight())
    expect(result.value.skills).toHaveLength(3)
  })

  it('should paginate skills correctly', async () => {
    await Promise.all(
      Array.from({ length: 5 }).map((_, i) =>
        skillRepository.create(makeSkill({ name: `Skill ${i + 1}` }))
      )
    )

    const page1 = await sut.execute({ search: '', page: 1, limit: 3 })
    const page2 = await sut.execute({ search: '', page: 2, limit: 3 })

    assert(page1.isRight())
    expect(page1.value.skills).toHaveLength(3)

    assert(page2.isRight())
    expect(page2.value.skills).toHaveLength(2)
  })
})
