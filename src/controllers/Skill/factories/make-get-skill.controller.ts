import { PrismaBattleFieldRepository } from '../../../repositories/prisma/prisma-battle-field-repository'
import { CachedBattleFieldRepository } from '../../../repositories/redis/cached-battle-field-repository'
import { PrismaPowerRepository } from '../../../repositories/prisma/prisma-power-repository'
import { CachedPowerRepository } from '../../../repositories/redis/cached-power-repository'
import { PrismaSkillRepository } from '../../../repositories/prisma/prisma-skill-repository'
import { CachedSkillRepository } from '../../../repositories/redis/cached-skill-repository'
import { GetSkillUseCase } from '../../../use-cases/Skill/get-skill'
import { GetSkillController } from '../get-skill.controller'

export function makeGetSkillController(): GetSkillController {
  const skillRepository = new CachedSkillRepository(new PrismaSkillRepository())
  const powerRepository = new CachedPowerRepository(new PrismaPowerRepository())
  const battleFieldRepository = new CachedBattleFieldRepository(new PrismaBattleFieldRepository())
  const getSkillUseCase = new GetSkillUseCase(
    skillRepository,
    powerRepository,
    battleFieldRepository
  )
  const getSkillController = new GetSkillController(getSkillUseCase)

  return getSkillController
}
