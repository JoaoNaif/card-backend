import { PrismaBattleFieldRepository } from '../../../repositories/prisma/prisma-battle-field-repository'
import { CachedBattleFieldRepository } from '../../../repositories/redis/cached-battle-field-repository'
import { PrismaCharacterRepository } from '../../../repositories/prisma/prisma-character-repository'
import { CachedCharacterRepository } from '../../../repositories/redis/cached-character-repository'
import { PrismaCharacterSkillRepository } from '../../../repositories/prisma/prisma-character-skill-repository'
import { CachedCharacterSkillRepository } from '../../../repositories/redis/cached-character-skill-repository'
import { PrismaPowerRepository } from '../../../repositories/prisma/prisma-power-repository'
import { CachedPowerRepository } from '../../../repositories/redis/cached-power-repository'
import { PrismaSkillRepository } from '../../../repositories/prisma/prisma-skill-repository'
import { CachedSkillRepository } from '../../../repositories/redis/cached-skill-repository'
import { GetCharacterUseCase } from '../../../use-cases/Character/get-character'
import { GetCharacterController } from '../get-character.controller'

export function makeGetCharacterController(): GetCharacterController {
  const characterRepository = new CachedCharacterRepository(new PrismaCharacterRepository())
  const powerRepository = new CachedPowerRepository(new PrismaPowerRepository())
  const characterSkillRepository = new CachedCharacterSkillRepository(new PrismaCharacterSkillRepository())
  const skillRepository = new CachedSkillRepository(new PrismaSkillRepository())
  const battleFieldRepository = new CachedBattleFieldRepository(new PrismaBattleFieldRepository())
  const getCharacterUseCase = new GetCharacterUseCase(
    characterRepository,
    powerRepository,
    characterSkillRepository,
    skillRepository,
    battleFieldRepository
  )

  return new GetCharacterController(getCharacterUseCase)
}
