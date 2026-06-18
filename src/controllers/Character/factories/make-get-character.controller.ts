import { PrismaCharacterRepository } from '../../../repositories/prisma/prisma-character-repository'
import { PrismaCharacterSkillRepository } from '../../../repositories/prisma/prisma-character-skill-repository'
import { PrismaPowerRepository } from '../../../repositories/prisma/prisma-power-repository'
import { PrismaSkillRepository } from '../../../repositories/prisma/prisma-skill-repository'
import { GetCharacterUseCase } from '../../../use-cases/Character/get-character'
import { GetCharacterController } from '../get-character.controller'

export function makeGetCharacterController(): GetCharacterController {
  const characterRepository = new PrismaCharacterRepository()
  const powerRepository = new PrismaPowerRepository()
  const characterSkillRepository = new PrismaCharacterSkillRepository()
  const skillRepository = new PrismaSkillRepository()
  const getCharacterUseCase = new GetCharacterUseCase(
    characterRepository,
    powerRepository,
    characterSkillRepository,
    skillRepository
  )

  return new GetCharacterController(getCharacterUseCase)
}
