import { PrismaBattleFieldRepository } from '../../../repositories/prisma/prisma-battle-field-repository'
import { CachedBattleFieldRepository } from '../../../repositories/redis/cached-battle-field-repository'
import { PrismaCharacterRepository } from '../../../repositories/prisma/prisma-character-repository'
import { CachedCharacterRepository } from '../../../repositories/redis/cached-character-repository'
import { PrismaCharacterSkillRepository } from '../../../repositories/prisma/prisma-character-skill-repository'
import { CachedCharacterSkillRepository } from '../../../repositories/redis/cached-character-skill-repository'
import { PrismaMachineMemberRepository } from '../../../repositories/prisma/prisma-machine-member-repository'
import { CachedMachineMemberRepository } from '../../../repositories/redis/cached-machine-member-repository'
import { PrismaMachineRepository } from '../../../repositories/prisma/prisma-machine-repository'
import { CachedMachineRepository } from '../../../repositories/redis/cached-machine-repository'
import { PrismaPowerRepository } from '../../../repositories/prisma/prisma-power-repository'
import { CachedPowerRepository } from '../../../repositories/redis/cached-power-repository'
import { PrismaSkillRepository } from '../../../repositories/prisma/prisma-skill-repository'
import { CachedSkillRepository } from '../../../repositories/redis/cached-skill-repository'
import { GetCharacterUseCase } from '../../../use-cases/Character/get-character'
import { GetMachineTeamUseCase } from '../../../use-cases/Battle/get-machine-team'
import { GetMachineTeamController } from '../get-machine-team.controller'

export function makeGetMachineTeamController(): GetMachineTeamController {
  const machineRepository = new CachedMachineRepository(new PrismaMachineRepository())
  const machineMemberRepository = new CachedMachineMemberRepository(new PrismaMachineMemberRepository())

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

  const useCase = new GetMachineTeamUseCase(
    machineRepository,
    machineMemberRepository,
    getCharacterUseCase
  )

  return new GetMachineTeamController(useCase)
}
