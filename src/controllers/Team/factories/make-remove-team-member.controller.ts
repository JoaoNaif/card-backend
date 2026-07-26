import { PrismaTeamMemberRepository } from '../../../repositories/prisma/prisma-team-member-repository'
import { PrismaTeamRepository } from '../../../repositories/prisma/prisma-team-repository'
import { RemoveTeamMemberUseCase } from '../../../use-cases/Team/remove-team-member'
import { RemoveTeamMemberController } from '../remove-team-member.controller'

export function makeRemoveTeamMemberController(): RemoveTeamMemberController {
  const teamRepository = new PrismaTeamRepository()
  const teamMemberRepository = new PrismaTeamMemberRepository()

  const removeTeamMemberUseCase = new RemoveTeamMemberUseCase(
    teamRepository,
    teamMemberRepository
  )

  return new RemoveTeamMemberController(removeTeamMemberUseCase)
}
