import { describe, it, expect, beforeEach } from 'vitest'
import { InMemoryUserRepository } from '../../repositories/test/in-memory-user-repository'
import { makeUser } from '../../repositories/test/factories/make-user'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'
import { UserRole } from '../../entities/user'
import { UnauthorizedError } from '../../core/error/err/unauthorized-error'
import { InMemorySkillRepository } from '../../repositories/test/in-memory-skill-repository'
import { RemoveSkillUseCase } from './remove-skill'
import { makeSkill } from '../../repositories/test/factories/make-skill'

let userRepository: InMemoryUserRepository
let skillRepository: InMemorySkillRepository
let sut: RemoveSkillUseCase

describe('RemoveSkillUseCase', () => {
  beforeEach(() => {
    userRepository = new InMemoryUserRepository()
    skillRepository = new InMemorySkillRepository()
    sut = new RemoveSkillUseCase(userRepository, skillRepository)
  })

  it('should remove a power successfully', async () => {
    const user = makeUser({
      name: 'John Snow',
      email: 'john@example.com',
      userRole: UserRole.ADMIN,
    })

    await userRepository.create(user)

    const skill = makeSkill()

    await skillRepository.create(skill)

    const result = await sut.execute({
      adminId: user.id.toString(),
      skillId: skill.id.toString(),
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(skillRepository.items.length).toBe(0)
    }
  })

  it('should return an error when user not found', async () => {
    const user = makeUser({
      name: 'John Snow',
      email: 'john@example.com',
      userRole: UserRole.ADMIN,
    })

    await userRepository.create(user)

    const skill = makeSkill()

    await skillRepository.create(skill)

    const result = await sut.execute({
      adminId: 'non exist',
      skillId: skill.id.toString(),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should return an error when user unauthorized', async () => {
    const user = makeUser({
      name: 'John Snow',
      email: 'john@example.com',
      userRole: UserRole.USER,
    })

    await userRepository.create(user)

    const skill = makeSkill()

    await skillRepository.create(skill)

    const result = await sut.execute({
      adminId: user.id.toString(),
      skillId: skill.id.toString(),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(UnauthorizedError)
  })
})
