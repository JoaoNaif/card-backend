import { PrismaCharacterRepository } from '../../../repositories/prisma/prisma-character-repository'
import { CachedCharacterRepository } from '../../../repositories/redis/cached-character-repository'
import { PrismaCharacterSkillRepository } from '../../../repositories/prisma/prisma-character-skill-repository'
import { CachedCharacterSkillRepository } from '../../../repositories/redis/cached-character-skill-repository'
import { PrismaSkillRepository } from '../../../repositories/prisma/prisma-skill-repository'
import { CachedSkillRepository } from '../../../repositories/redis/cached-skill-repository'
import { PrismaUserRepository } from '../../../repositories/prisma/prisma-user-repository'
import { SwapSkillUseCase } from '../../../use-cases/Skill/swap-skill'
import { SwapSkillController } from '../swap-skill.controller'

export function makeSwapSkillController(): SwapSkillController {
  const characterRepository = new CachedCharacterRepository(new PrismaCharacterRepository())
  const userRepository = new PrismaUserRepository()
  const skillRepository = new CachedSkillRepository(new PrismaSkillRepository())
  const characterSkillRepository = new CachedCharacterSkillRepository(new PrismaCharacterSkillRepository())
  const swapSkillUseCase = new SwapSkillUseCase(
    characterRepository,
    userRepository,
    skillRepository,
    characterSkillRepository
  )

  const swapSkillController = new SwapSkillController(swapSkillUseCase)
  return swapSkillController
}
