import { PrismaCharacterRepository } from '../../../repositories/prisma/prisma-character-repository'
import { PrismaCharacterSkillRepository } from '../../../repositories/prisma/prisma-character-skill-repository'
import { PrismaPendingSkillChoiceRepository } from '../../../repositories/prisma/prisma-pending-skill-choice-repository'
import { PrismaSkillRepository } from '../../../repositories/prisma/prisma-skill-repository'
import { PrismaUserRepository } from '../../../repositories/prisma/prisma-user-repository'
import { ResolveSkillOptionUseCase } from '../../../use-cases/Skill/resolve-skill-option'
import { ResolveSkillOptionController } from '../resolve-skill-option.controller'

export function makeResolveSkillOptionController(): ResolveSkillOptionController {
  const characterRepository = new PrismaCharacterRepository()
  const userRepository = new PrismaUserRepository()
  const skillRepository = new PrismaSkillRepository()
  const characterSkillRepository = new PrismaCharacterSkillRepository()
  const pendingSkillChoiceRepository = new PrismaPendingSkillChoiceRepository()
  const resolveSkillOptionUseCase = new ResolveSkillOptionUseCase(
    characterRepository,
    userRepository,
    skillRepository,
    characterSkillRepository,
    pendingSkillChoiceRepository
  )

  const resolveSkillOptionController = new ResolveSkillOptionController(
    resolveSkillOptionUseCase
  )
  return resolveSkillOptionController
}
