import { PrismaBattleFieldRepository } from '../../../repositories/prisma/prisma-battle-field-repository'
import { PrismaBattleParticipantRepository } from '../../../repositories/prisma/prisma-battle-participant-repository'
import { PrismaBattleRepository } from '../../../repositories/prisma/prisma-battle-repository'
import { PrismaBattleTeamRepository } from '../../../repositories/prisma/prisma-battle-team-repository'
import { PrismaCharacterRepository } from '../../../repositories/prisma/prisma-character-repository'
import { PrismaMachineMemberRepository } from '../../../repositories/prisma/prisma-machine-member-repository'
import { PrismaMachineRepository } from '../../../repositories/prisma/prisma-machine-repository'
import { PrismaSkillRepository } from '../../../repositories/prisma/prisma-skill-repository'
import { RedisPveSessionRepository } from '../../../repositories/redis/redis-pve-session-repository'
import { StartPveBattleUseCase } from '../../../use-cases/Battle/start-pve-battle'
import { StartPveBattleController } from '../start-pve-battle.controller'

export function makeStartPveBattleController(): StartPveBattleController {
  const battleRepository = new PrismaBattleRepository()
  const battleTeamRepository = new PrismaBattleTeamRepository()
  const battleParticipantRepository = new PrismaBattleParticipantRepository()
  const characterRepository = new PrismaCharacterRepository()
  const skillRepository = new PrismaSkillRepository()
  const battleFieldRepository = new PrismaBattleFieldRepository()
  const machineRepository = new PrismaMachineRepository()
  const machineMemberRepository = new PrismaMachineMemberRepository()
  const pveSessionRepository = new RedisPveSessionRepository()

  const useCase = new StartPveBattleUseCase(
    battleRepository,
    battleTeamRepository,
    battleParticipantRepository,
    characterRepository,
    skillRepository,
    battleFieldRepository,
    machineRepository,
    machineMemberRepository,
    pveSessionRepository
  )

  return new StartPveBattleController(useCase)
}
