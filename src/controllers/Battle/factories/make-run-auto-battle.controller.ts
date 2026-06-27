import { PrismaBattleFieldRepository } from '../../../repositories/prisma/prisma-battle-field-repository'
import { PrismaBattleParticipantRepository } from '../../../repositories/prisma/prisma-battle-participant-repository'
import { PrismaBattleRepository } from '../../../repositories/prisma/prisma-battle-repository'
import { PrismaBattleTeamRepository } from '../../../repositories/prisma/prisma-battle-team-repository'
import { PrismaCharacterRepository } from '../../../repositories/prisma/prisma-character-repository'
import { PrismaSkillRepository } from '../../../repositories/prisma/prisma-skill-repository'
import { RunAutoBattleUseCase } from '../../../use-cases/Battle/run-auto-battle'
import { RunAutoBattleController } from '../run-auto-battle.controller'

export function makeRunAutoBattleController(): RunAutoBattleController {
  const battleRepository = new PrismaBattleRepository()
  const battleTeamRepository = new PrismaBattleTeamRepository()
  const battleParticipantRepository = new PrismaBattleParticipantRepository()
  const characterRepository = new PrismaCharacterRepository()
  const skillRepository = new PrismaSkillRepository()
  const battleFieldRepository = new PrismaBattleFieldRepository()

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
