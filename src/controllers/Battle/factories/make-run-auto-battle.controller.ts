import { PrismaBattleFieldRepository } from '../../../repositories/prisma/prisma-battle-field-repository'
import { CachedBattleFieldRepository } from '../../../repositories/redis/cached-battle-field-repository'
import { PrismaBattleParticipantRepository } from '../../../repositories/prisma/prisma-battle-participant-repository'
import { PrismaBattleRepository } from '../../../repositories/prisma/prisma-battle-repository'
import { PrismaBattleTeamRepository } from '../../../repositories/prisma/prisma-battle-team-repository'
import { PrismaCharacterRepository } from '../../../repositories/prisma/prisma-character-repository'
import { CachedCharacterRepository } from '../../../repositories/redis/cached-character-repository'
import { PrismaSkillRepository } from '../../../repositories/prisma/prisma-skill-repository'
import { CachedSkillRepository } from '../../../repositories/redis/cached-skill-repository'
import { RunAutoBattleUseCase } from '../../../use-cases/Battle/run-auto-battle'
import { RunAutoBattleController } from '../run-auto-battle.controller'

export function makeRunAutoBattleController(): RunAutoBattleController {
  const battleRepository = new PrismaBattleRepository()
  const battleTeamRepository = new PrismaBattleTeamRepository()
  const battleParticipantRepository = new PrismaBattleParticipantRepository()
  const characterRepository = new CachedCharacterRepository(new PrismaCharacterRepository())
  const skillRepository = new CachedSkillRepository(new PrismaSkillRepository())
  const battleFieldRepository = new CachedBattleFieldRepository(new PrismaBattleFieldRepository())

  const useCase = new RunAutoBattleUseCase(
    battleRepository,
    battleTeamRepository,
    battleParticipantRepository,
    characterRepository,
    skillRepository,
    battleFieldRepository
  )

  return new RunAutoBattleController(useCase)
}
