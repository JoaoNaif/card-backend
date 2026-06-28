import { describe, it, expect, beforeEach } from 'vitest'
import { InMemoryUserRepository } from '../../repositories/test/in-memory-user-repository'
import { makeUser } from '../../repositories/test/factories/make-user'
import { ResourceAlreadyExistError } from '../../core/error/err/resource-already-exist-error'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'
import { EditSkillUseCase } from './edit-skill'
import { InMemoryPowerRepository } from '../../repositories/test/in-memory-power-repository'
import { UserRole } from '../../entities/user'
import { UnauthorizedError } from '../../core/error/err/unauthorized-error'
import { InMemorySkillRepository } from '../../repositories/test/in-memory-skill-repository'
import { InMemoryBattleFieldRepository } from '../../repositories/test/in-memory-battle-field-repository'
import { makeSkill } from '../../repositories/test/factories/make-skill'

let userRepository: InMemoryUserRepository
let powerRepository: InMemoryPowerRepository
let skillRepository: InMemorySkillRepository
let battleFieldRepository: InMemoryBattleFieldRepository
let sut: EditSkillUseCase

describe('EditSkillUseCase', () => {
  beforeEach(() => {
    userRepository = new InMemoryUserRepository()
    powerRepository = new InMemoryPowerRepository()
    skillRepository = new InMemorySkillRepository()
    battleFieldRepository = new InMemoryBattleFieldRepository()
    sut = new EditSkillUseCase(
      userRepository,
      skillRepository,
      battleFieldRepository,
      powerRepository
    )
  })

  it('should edit a skill successfully', async () => {
    const user = makeUser({
      name: 'John Snow',
      email: 'john@example.com',
      userRole: UserRole.ADMIN,
    })

    await userRepository.create(user)

    const skill = makeSkill({ name: 'Gelo', description: 'Manipula o gelo' })

    await skillRepository.create(skill)

    const result = await sut.execute({
      adminId: user.id.toString(),
      skillId: skill.id.toString(),
      name: 'Gelo Negro',
      description: 'Manipula o gelo negro',
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(skill.name).toBe('Gelo Negro')
      expect(skill.description).toBe('Manipula o gelo negro')
    }
  })

  it('should return an error when user is not admin', async () => {
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
      name: 'Gelo Negro',
      description: 'Manipula o gelo',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(UnauthorizedError)
  })

  it('should return an error when name is already in use', async () => {
    const user = makeUser({
      name: 'John Snow',
      email: 'john@example.com',
      userRole: UserRole.ADMIN,
    })

    await userRepository.create(user)

    const existingSkill = makeSkill({ name: 'Gelo Negro' })
    const skill = makeSkill({ name: 'Gelo' })

    await skillRepository.create(existingSkill)
    await skillRepository.create(skill)

    const result = await sut.execute({
      adminId: user.id.toString(),
      skillId: skill.id.toString(),
      name: 'Gelo Negro',
      description: 'Manipula o gelo',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceAlreadyExistError)
  })

  it('should return an error when user not found', async () => {
    const skill = makeSkill()

    await skillRepository.create(skill)

    const result = await sut.execute({
      adminId: 'non-existing-user',
      skillId: skill.id.toString(),
      name: 'Gelo Negro',
      description: 'Manipula o gelo',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should return an error when skill not found', async () => {
    const user = makeUser({
      name: 'John Snow',
      email: 'john@example.com',
      userRole: UserRole.ADMIN,
    })

    await userRepository.create(user)

    const result = await sut.execute({
      adminId: user.id.toString(),
      skillId: 'non-existing-skill',
      name: 'Gelo Negro',
      description: 'Manipula o gelo',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
