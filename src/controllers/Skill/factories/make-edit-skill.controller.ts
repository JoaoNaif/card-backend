import { PrismaBattleFieldRepository } from '../../../repositories/prisma/prisma-battle-field-repository'
import { PrismaPowerRepository } from '../../../repositories/prisma/prisma-power-repository'
import { PrismaSkillRepository } from '../../../repositories/prisma/prisma-skill-repository'
import { PrismaUserRepository } from '../../../repositories/prisma/prisma-user-repository'
import { EditSkillUseCase } from '../../../use-cases/Skill/edit-skill'
import { EditSkillController } from '../edit-skill.controller'

export function makeEditSkillController(): EditSkillController {
  const powerRepository = new PrismaPowerRepository()
  const skillRepository = new PrismaSkillRepository()
  const battleFieldRepository = new PrismaBattleFieldRepository()
  const userRepository = new PrismaUserRepository()
  const editSkillController = new EditSkillUseCase(
    userRepository,
    skillRepository,
    battleFieldRepository,
    powerRepository
  )

  return new EditSkillController(editSkillController)
}
