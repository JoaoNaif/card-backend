import { PrismaTraitRepository } from '../../../repositories/prisma/prisma-trait-repository'
import { PrismaUserRepository } from '../../../repositories/prisma/prisma-user-repository'
import { CreateTraitUseCase } from '../../../use-cases/Trait/create-trait'
import { CreateTraitController } from '../create-trait.controller'

export function makeCreateTraitController(): CreateTraitController {
  const traitRepository = new PrismaTraitRepository()
  const userRepository = new PrismaUserRepository()
  const createTraitController = new CreateTraitUseCase(
    traitRepository,
    userRepository
  )

  return new CreateTraitController(createTraitController)
}
