import { describe, it, expect, beforeEach } from 'vitest'
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

  it('should fetch a skill successfully', async () => {
    await Promise.all(
      Array.from({ length: 3 }).map((_, i) =>
        skillRepository.create(makeSkill({ name: `Skill ${i + 1}` }))
      )
    )

    const result = await sut.execute({
      search: '',
      limit: 10,
      page: 1,
    })

    expect(result.isRight()).toBe(true)
    expect(skillRepository.items).toHaveLength(3)
  })
})
