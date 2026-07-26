import { PrismaCharacterRepository } from '../../../repositories/prisma/prisma-character-repository'
import { PrismaTeamMemberRepository } from '../../../repositories/prisma/prisma-team-member-repository'
import { PrismaTeamRepository } from '../../../repositories/prisma/prisma-team-repository'
import { GetTeamUseCase } from '../../../use-cases/Team/get-team'
import { GetTeamController } from '../get-team.controller'

export function makeGetTeamController(): GetTeamController {
  const teamRepository = new PrismaTeamRepository()
  const teamMemberRepository = new PrismaTeamMemberRepository()
  const characterRepository = new PrismaCharacterRepository()

  const getTeamUseCase = new GetTeamUseCase(
    teamRepository,
    teamMemberRepository,
    characterRepository
  )

  return new GetTeamController(getTeamUseCase)
}
