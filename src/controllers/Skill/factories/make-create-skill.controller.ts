import { PrismaBattleFieldRepository } from '../../../repositories/prisma/prisma-battle-field-repository'
import { CachedBattleFieldRepository } from '../../../repositories/redis/cached-battle-field-repository'
import { PrismaPowerRepository } from '../../../repositories/prisma/prisma-power-repository'
import { CachedPowerRepository } from '../../../repositories/redis/cached-power-repository'
import { PrismaSkillRepository } from '../../../repositories/prisma/prisma-skill-repository'
import { CachedSkillRepository } from '../../../repositories/redis/cached-skill-repository'
import { PrismaUserRepository } from '../../../repositories/prisma/prisma-user-repository'
import { CreateSkillUseCase } from '../../../use-cases/Skill/create-skill'
import { CreateSkillController } from '../create-skill.controller'

export function makeCreateSkillController(): CreateSkillController {
  const skillRepository = new CachedSkillRepository(new PrismaSkillRepository())
  const userRepository = new PrismaUserRepository()
  const powerRepository = new CachedPowerRepository(new PrismaPowerRepository())
  const battleFieldRepository = new CachedBattleFieldRepository(new PrismaBattleFieldRepository())
  const createSkillUseCase = new CreateSkillUseCase(
    skillRepository,
    userRepository,
    powerRepository,
    battleFieldRepository
  )
  const createSkillController = new CreateSkillController(createSkillUseCase)

  return createSkillController
}
