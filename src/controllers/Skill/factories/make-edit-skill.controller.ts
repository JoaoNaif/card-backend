import { PrismaBattleFieldRepository } from '../../../repositories/prisma/prisma-battle-field-repository'
import { CachedBattleFieldRepository } from '../../../repositories/redis/cached-battle-field-repository'
import { PrismaPowerRepository } from '../../../repositories/prisma/prisma-power-repository'
import { CachedPowerRepository } from '../../../repositories/redis/cached-power-repository'
import { PrismaSkillRepository } from '../../../repositories/prisma/prisma-skill-repository'
import { CachedSkillRepository } from '../../../repositories/redis/cached-skill-repository'
import { PrismaUserRepository } from '../../../repositories/prisma/prisma-user-repository'
import { EditSkillUseCase } from '../../../use-cases/Skill/edit-skill'
import { EditSkillController } from '../edit-skill.controller'

export function makeEditSkillController(): EditSkillController {
  const powerRepository = new CachedPowerRepository(new PrismaPowerRepository())
  const skillRepository = new CachedSkillRepository(new PrismaSkillRepository())
  const battleFieldRepository = new CachedBattleFieldRepository(new PrismaBattleFieldRepository())
  const userRepository = new PrismaUserRepository()
  const editSkillController = new EditSkillUseCase(
    userRepository,
    skillRepository,
    battleFieldRepository,
    powerRepository
  )

  return new EditSkillController(editSkillController)
}
