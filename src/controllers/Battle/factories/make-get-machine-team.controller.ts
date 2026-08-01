import { PrismaBattleFieldRepository } from '../../../repositories/prisma/prisma-battle-field-repository'
import { PrismaCharacterRepository } from '../../../repositories/prisma/prisma-character-repository'
import { PrismaCharacterSkillRepository } from '../../../repositories/prisma/prisma-character-skill-repository'
import { PrismaMachineMemberRepository } from '../../../repositories/prisma/prisma-machine-member-repository'
import { PrismaMachineRepository } from '../../../repositories/prisma/prisma-machine-repository'
import { PrismaPowerRepository } from '../../../repositories/prisma/prisma-power-repository'
import { PrismaSkillRepository } from '../../../repositories/prisma/prisma-skill-repository'
import { GetCharacterUseCase } from '../../../use-cases/Character/get-character'
import { GetMachineTeamUseCase } from '../../../use-cases/Battle/get-machine-team'
import { GetMachineTeamController } from '../get-machine-team.controller'

export function makeGetMachineTeamController(): GetMachineTeamController {
  const machineRepository = new PrismaMachineRepository()
  const machineMemberRepository = new PrismaMachineMemberRepository()

  const characterRepository = new PrismaCharacterRepository()
  const powerRepository = new PrismaPowerRepository()
  const characterSkillRepository = new PrismaCharacterSkillRepository()
  const skillRepository = new PrismaSkillRepository()
  const battleFieldRepository = new PrismaBattleFieldRepository()
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
