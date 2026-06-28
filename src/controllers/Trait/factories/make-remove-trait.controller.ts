import { PrismaTraitRepository } from '../../../repositories/prisma/prisma-trait-repository'
import { PrismaUserRepository } from '../../../repositories/prisma/prisma-user-repository'
import { RemoveTraitUseCase } from '../../../use-cases/Trait/remove-trait'
import { RemoveTraitController } from '../remove-trait.controller'

export function makeRemoveTraitController(): RemoveTraitController {
  const traitRepository = new PrismaTraitRepository()
  const userRepository = new PrismaUserRepository()
  const removeTraitController = new RemoveTraitUseCase(
    userRepository,
    traitRepository
  )

  return new RemoveTraitController(removeTraitController)
}
