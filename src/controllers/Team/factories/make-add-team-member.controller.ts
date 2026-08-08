import { PrismaCharacterRepository } from '../../../repositories/prisma/prisma-character-repository'
import { CachedCharacterRepository } from '../../../repositories/redis/cached-character-repository'
import { PrismaTeamMemberRepository } from '../../../repositories/prisma/prisma-team-member-repository'
import { PrismaTeamRepository } from '../../../repositories/prisma/prisma-team-repository'
import { AddTeamMemberUseCase } from '../../../use-cases/Team/add-team-member'
import { AddTeamMemberController } from '../add-team-member.controller'

export function makeAddTeamMemberController(): AddTeamMemberController {
  const teamRepository = new PrismaTeamRepository()
  const teamMemberRepository = new PrismaTeamMemberRepository()
  const characterRepository = new CachedCharacterRepository(new PrismaCharacterRepository())

  const addTeamMemberUseCase = new AddTeamMemberUseCase(
    teamRepository,
    teamMemberRepository,
    characterRepository
  )

  return new AddTeamMemberController(addTeamMemberUseCase)
}
