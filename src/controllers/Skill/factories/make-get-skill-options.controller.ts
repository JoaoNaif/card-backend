import { PrismaBattleFieldRepository } from '../../../repositories/prisma/prisma-battle-field-repository'
import { CachedBattleFieldRepository } from '../../../repositories/redis/cached-battle-field-repository'
import { PrismaCharacterRepository } from '../../../repositories/prisma/prisma-character-repository'
import { CachedCharacterRepository } from '../../../repositories/redis/cached-character-repository'
import { PrismaCharacterSkillRepository } from '../../../repositories/prisma/prisma-character-skill-repository'
import { CachedCharacterSkillRepository } from '../../../repositories/redis/cached-character-skill-repository'
import { PrismaPendingSkillChoiceRepository } from '../../../repositories/prisma/prisma-pending-skill-choice-repository'
import { PrismaPowerRepository } from '../../../repositories/prisma/prisma-power-repository'
import { CachedPowerRepository } from '../../../repositories/redis/cached-power-repository'
import { PrismaSkillRepository } from '../../../repositories/prisma/prisma-skill-repository'
import { CachedSkillRepository } from '../../../repositories/redis/cached-skill-repository'
import { PrismaUserRepository } from '../../../repositories/prisma/prisma-user-repository'
import { GetSkillOptionsUseCase } from '../../../use-cases/Skill/get-skill-options'
import { GetSkillOptionsController } from '../get-skill-options.controller'

export function makeGetSkillOptionsController(): GetSkillOptionsController {
  const characterRepository = new CachedCharacterRepository(new PrismaCharacterRepository())
  const userRepository = new PrismaUserRepository()
  const skillRepository = new CachedSkillRepository(new PrismaSkillRepository())
  const characterSkillRepository = new CachedCharacterSkillRepository(new PrismaCharacterSkillRepository())
  const powerRepository = new CachedPowerRepository(new PrismaPowerRepository())
  const battleFieldRepository = new CachedBattleFieldRepository(new PrismaBattleFieldRepository())
  const pendingSkillChoiceRepository = new PrismaPendingSkillChoiceRepository()
  const getSkillOptionsUseCase = new GetSkillOptionsUseCase(
    characterRepository,
    userRepository,
    skillRepository,
    characterSkillRepository,
    powerRepository,
    battleFieldRepository,
    pendingSkillChoiceRepository
  )

  const getSkillOptionsController = new GetSkillOptionsController(
    getSkillOptionsUseCase
  )
  return getSkillOptionsController
}
