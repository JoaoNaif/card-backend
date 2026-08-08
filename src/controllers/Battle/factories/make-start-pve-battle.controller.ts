import { PrismaBattleFieldRepository } from '../../../repositories/prisma/prisma-battle-field-repository'
import { CachedBattleFieldRepository } from '../../../repositories/redis/cached-battle-field-repository'
import { PrismaBattleParticipantRepository } from '../../../repositories/prisma/prisma-battle-participant-repository'
import { PrismaBattleRepository } from '../../../repositories/prisma/prisma-battle-repository'
import { PrismaBattleTeamRepository } from '../../../repositories/prisma/prisma-battle-team-repository'
import { PrismaCharacterRepository } from '../../../repositories/prisma/prisma-character-repository'
import { CachedCharacterRepository } from '../../../repositories/redis/cached-character-repository'
import { PrismaMachineMemberRepository } from '../../../repositories/prisma/prisma-machine-member-repository'
import { CachedMachineMemberRepository } from '../../../repositories/redis/cached-machine-member-repository'
import { PrismaMachineRepository } from '../../../repositories/prisma/prisma-machine-repository'
import { CachedMachineRepository } from '../../../repositories/redis/cached-machine-repository'
import { PrismaSkillRepository } from '../../../repositories/prisma/prisma-skill-repository'
import { CachedSkillRepository } from '../../../repositories/redis/cached-skill-repository'
import { RedisPveSessionRepository } from '../../../repositories/redis/redis-pve-session-repository'
import { StartPveBattleUseCase } from '../../../use-cases/Battle/start-pve-battle'
import { StartPveBattleController } from '../start-pve-battle.controller'

export function makeStartPveBattleController(): StartPveBattleController {
  const battleRepository = new PrismaBattleRepository()
  const battleTeamRepository = new PrismaBattleTeamRepository()
  const battleParticipantRepository = new PrismaBattleParticipantRepository()
  const characterRepository = new CachedCharacterRepository(new PrismaCharacterRepository())
  const skillRepository = new CachedSkillRepository(new PrismaSkillRepository())
  const battleFieldRepository = new CachedBattleFieldRepository(new PrismaBattleFieldRepository())
  const machineRepository = new CachedMachineRepository(new PrismaMachineRepository())
  const machineMemberRepository = new CachedMachineMemberRepository(new PrismaMachineMemberRepository())
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
