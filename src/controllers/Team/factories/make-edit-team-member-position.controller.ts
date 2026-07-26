import { PrismaCharacterRepository } from '../../../repositories/prisma/prisma-character-repository'
import { PrismaTeamMemberRepository } from '../../../repositories/prisma/prisma-team-member-repository'
import { PrismaTeamRepository } from '../../../repositories/prisma/prisma-team-repository'
import { EditTeamMemberPositionUseCase } from '../../../use-cases/Team/edit-team-member-position'
import { EditTeamMemberPositionController } from '../edit-team-member-position.controller'

export function makeEditTeamMemberPositionController(): EditTeamMemberPositionController {
  const teamRepository = new PrismaTeamRepository()
  const teamMemberRepository = new PrismaTeamMemberRepository()
  const characterRepository = new PrismaCharacterRepository()

  const editTeamMemberPositionUseCase = new EditTeamMemberPositionUseCase(
    teamRepository,
    teamMemberRepository,
    characterRepository
  )

  return new EditTeamMemberPositionController(editTeamMemberPositionUseCase)
}