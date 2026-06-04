import { PrismaTraitRepository } from '../../../repositories/prisma/prisma-trait-repository'
import { PrismaUserRepository } from '../../../repositories/prisma/prisma-user-repository'
import { FetchTraitUseCase } from '../../../use-cases/Trait/fetch-trait'
import { FetchTraitController } from '../fetch-trait.controller'

export function makeFetchTraitController(): FetchTraitController {
  const userRepository = new PrismaUserRepository()
  const traitRepository = new PrismaTraitRepository()
  const fetchTraitUseCase = new FetchTraitUseCase(
    traitRepository,
    userRepository
  )

  return new FetchTraitController(fetchTraitUseCase)
}
