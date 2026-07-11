import { PrismaBattleFieldRepository } from '../../../repositories/prisma/prisma-battle-field-repository'
import { PrismaPowerRepository } from '../../../repositories/prisma/prisma-power-repository'
import { PrismaSkillRepository } from '../../../repositories/prisma/prisma-skill-repository'
import { PrismaUserRepository } from '../../../repositories/prisma/prisma-user-repository'
import { CreateSkillUseCase } from '../../../use-cases/Skill/create-skill'
import { CreateSkillController } from '../create-skill.controller'

export function makeCreateSkillController(): CreateSkillController {
  const skillRepository = new PrismaSkillRepository()
  const userRepository = new PrismaUserRepository()
  const powerRepository = new PrismaPowerRepository()
  const battleFieldRepository = new PrismaBattleFieldRepository()
  const createSkillUseCase = new CreateSkillUseCase(
    skillRepository,
    userRepository,
    powerRepository,
    battleFieldRepository
  )
  const createSkillController = new CreateSkillController(createSkillUseCase)

  return createSkillController
}
