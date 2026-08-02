import { PrismaBattleRepository } from '../../../repositories/prisma/prisma-battle-repository'
import { PrismaBattleTeamRepository } from '../../../repositories/prisma/prisma-battle-team-repository'
import { PrismaUserRepository } from '../../../repositories/prisma/prisma-user-repository'
import { ListBattleHistoryUseCase } from '../../../use-cases/Battle/list-battle-history'
import { ListBattleHistoryController } from '../list-battle-history.controller'

export function makeListBattleHistoryController(): ListBattleHistoryController {
  const battleTeamRepository = new PrismaBattleTeamRepository()
  const battleRepository = new PrismaBattleRepository()
  const userRepository = new PrismaUserRepository()

  const useCase = new ListBattleHistoryUseCase(
    battleTeamRepository,
    battleRepository,
    userRepository
  )

  return new ListBattleHistoryController(useCase)
}
