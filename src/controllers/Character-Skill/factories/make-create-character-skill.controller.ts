import { PrismaCharacterSkillRepository } from '../../../repositories/prisma/prisma-character-skill-repository'
import { PrismaSkillRepository } from '../../../repositories/prisma/prisma-skill-repository'
import { PrismaCharacterRepository } from '../../../repositories/prisma/prisma-character-repository'
import { CreateCharacterSkillUseCase } from '../../../use-cases/Character-Skill/create-character-skill'
import { CreateCharacterSkillController } from '../create-character-skill.controller'

export function makeCreateCharacterSkillController(): CreateCharacterSkillController {
  const characterSkillRepository = new PrismaCharacterSkillRepository()
  const skillRepository = new PrismaSkillRepository()
  const characterRepository = new PrismaCharacterRepository()
  const createCharacterSkillUseCase = new CreateCharacterSkillUseCase(
    characterSkillRepository,
    skillRepository,
    characterRepository
  )
  return new CreateCharacterSkillController(createCharacterSkillUseCase)
}
