import { PrismaTraitRepository } from '../../../repositories/prisma/prisma-trait-repository'
import { PrismaUserRepository } from '../../../repositories/prisma/prisma-user-repository'
import { EditTraitUseCase } from '../../../use-cases/Trait/edit-trait'
import { EditTraitController } from '../edit-trait.controller'

export function makeEditTraitController(): EditTraitController {
  const traitRepository = new PrismaTraitRepository()
  const userRepository = new PrismaUserRepository()
  const editTraitController = new EditTraitUseCase(
    userRepository,
    traitRepository
  )

  return new EditTraitController(editTraitController)
}
