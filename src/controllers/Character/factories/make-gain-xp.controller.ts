import { PrismaCharacterRepository } from '../../../repositories/prisma/prisma-character-repository'
import { CachedCharacterRepository } from '../../../repositories/redis/cached-character-repository'
import { PrismaPowerRepository } from '../../../repositories/prisma/prisma-power-repository'
import { CachedPowerRepository } from '../../../repositories/redis/cached-power-repository'
import { PrismaPowerAwakeningRepository } from '../../../repositories/prisma/prisma-power-awakening-repository'
import { GainXpUseCase } from '../../../use-cases/Character/gain-xp'
import { GainXpController } from '../gain-xp.controller'

export function makeGainXpController(): GainXpController {
  const characterRepository = new CachedCharacterRepository(new PrismaCharacterRepository())
  const powerRepository = new CachedPowerRepository(new PrismaPowerRepository())
  const powerAwakeningRepository = new PrismaPowerAwakeningRepository()
  const gainXpUseCase = new GainXpUseCase(characterRepository, powerRepository, powerAwakeningRepository)

  const gainXpController = new GainXpController(gainXpUseCase)
  return gainXpController
}
