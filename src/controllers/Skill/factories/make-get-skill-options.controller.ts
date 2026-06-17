import { PrismaCharacterRepository } from '../../../repositories/prisma/prisma-character-repository'
import { PrismaCharacterSkillRepository } from '../../../repositories/prisma/prisma-character-skill-repository'
import { PrismaSkillRepository } from '../../../repositories/prisma/prisma-skill-repository'
import { PrismaUserRepository } from '../../../repositories/prisma/prisma-user-repository'
import { GetSkillOptionsUseCase } from '../../../use-cases/Skill/get-skill-options'
import { GetSkillOptionsController } from '../get-skill-options.controller'

export function makeGetSkillOptionsController(): GetSkillOptionsController {
  const characterRepository = new PrismaCharacterRepository()
  const userRepository = new PrismaUserRepository()
  const skillRepository = new PrismaSkillRepository()
  const characterSkillRepository = new PrismaCharacterSkillRepository()
  const getSkillOptionsUseCase = new GetSkillOptionsUseCase(
    characterRepository,
    userRepository,
    skillRepository,
    characterSkillRepository
  )

  const getSkillOptionsController = new GetSkillOptionsController(
    getSkillOptionsUseCase
  )
  return getSkillOptionsController
}
