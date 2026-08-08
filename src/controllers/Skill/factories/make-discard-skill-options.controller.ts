import { PrismaCharacterRepository } from '../../../repositories/prisma/prisma-character-repository'
import { CachedCharacterRepository } from '../../../repositories/redis/cached-character-repository'
import { PrismaPendingSkillChoiceRepository } from '../../../repositories/prisma/prisma-pending-skill-choice-repository'
import { PrismaUserRepository } from '../../../repositories/prisma/prisma-user-repository'
import { DiscardSkillOptionsUseCase } from '../../../use-cases/Skill/discard-skill-options'
import { DiscardSkillOptionsController } from '../discard-skill-options.controller'

export function makeDiscardSkillOptionsController(): DiscardSkillOptionsController {
  const characterRepository = new CachedCharacterRepository(new PrismaCharacterRepository())
  const userRepository = new PrismaUserRepository()
  const pendingSkillChoiceRepository = new PrismaPendingSkillChoiceRepository()
  const discardSkillOptionsUseCase = new DiscardSkillOptionsUseCase(
    characterRepository,
    userRepository,
    pendingSkillChoiceRepository
  )

  const discardSkillOptionsController = new DiscardSkillOptionsController(
    discardSkillOptionsUseCase
  )
  return discardSkillOptionsController
}
