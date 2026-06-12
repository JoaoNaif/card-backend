import { PrismaCharacterRepository } from '../../../repositories/prisma/prisma-character-repository'
import { GainXpUseCase } from '../../../use-cases/Character/gain-xp'
import { GainXpController } from '../gain-xp.controller'

export function makeGainXpController(): GainXpController {
  const characterRepository = new PrismaCharacterRepository()
  const gainXpUseCase = new GainXpUseCase(characterRepository)

  const gainXpController = new GainXpController(gainXpUseCase)
  return gainXpController
}
