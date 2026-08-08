import { PrismaCharacterRepository } from '../../../repositories/prisma/prisma-character-repository'
import { CachedCharacterRepository } from '../../../repositories/redis/cached-character-repository'
import { PrismaUserRepository } from '../../../repositories/prisma/prisma-user-repository'
import { PrismaTraitRepository } from '../../../repositories/prisma/prisma-trait-repository'
import { AssignTraitUseCase } from '../../../use-cases/Character/assign-trait'
import { AssignTraitController } from '../assign-trait.controller'

export function makeAssignTraitController(): AssignTraitController {
  const characterRepository = new CachedCharacterRepository(new PrismaCharacterRepository())
  const userRepository = new PrismaUserRepository()
  const traitRepository = new PrismaTraitRepository()
  const assignTraitUseCase = new AssignTraitUseCase(
    characterRepository,
    userRepository,
    traitRepository
  )
  return new AssignTraitController(assignTraitUseCase)
}
