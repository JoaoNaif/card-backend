import { PrismaCharacterSkillRepository } from '../../../repositories/prisma/prisma-character-skill-repository'
import { CachedCharacterSkillRepository } from '../../../repositories/redis/cached-character-skill-repository'
import { PrismaSkillRepository } from '../../../repositories/prisma/prisma-skill-repository'
import { CachedSkillRepository } from '../../../repositories/redis/cached-skill-repository'
import { PrismaCharacterRepository } from '../../../repositories/prisma/prisma-character-repository'
import { CachedCharacterRepository } from '../../../repositories/redis/cached-character-repository'
import { CreateCharacterSkillUseCase } from '../../../use-cases/Character-Skill/create-character-skill'
import { CreateCharacterSkillController } from '../create-character-skill.controller'

export function makeCreateCharacterSkillController(): CreateCharacterSkillController {
  const characterSkillRepository = new CachedCharacterSkillRepository(new PrismaCharacterSkillRepository())
  const skillRepository = new CachedSkillRepository(new PrismaSkillRepository())
  const characterRepository = new CachedCharacterRepository(new PrismaCharacterRepository())
  const createCharacterSkillUseCase = new CreateCharacterSkillUseCase(
    characterSkillRepository,
    skillRepository,
    characterRepository
  )
  return new CreateCharacterSkillController(createCharacterSkillUseCase)
}
