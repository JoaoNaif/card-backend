import { PrismaSkillRepository } from '../../../repositories/prisma/prisma-skill-repository'
import { PrismaUserRepository } from '../../../repositories/prisma/prisma-user-repository'
import { RemoveSkillUseCase } from '../../../use-cases/Skill/remove-skill'
import { RemoveSkillController } from '../remove-skill.controller'

export function makeRemoveSkillController(): RemoveSkillController {
  const userRepository = new PrismaUserRepository()
  const skillRepository = new PrismaSkillRepository()
  const removeSkillUseCase = new RemoveSkillUseCase(
    userRepository,
    skillRepository
  )
  const removeSkillController = new RemoveSkillController(removeSkillUseCase)

  return removeSkillController
}
