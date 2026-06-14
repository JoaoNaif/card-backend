import { left, right, type Either } from '../../core/either'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'
import type { ICharacterRepository } from '../../repositories/interface/character-repository'
import type { IPowerAwakeningRepository } from '../../repositories/interface/power-awakening-repository'
import type { IPowerRepository } from '../../repositories/interface/power-repository'

const AWAKEN_CHANCE = 0.1

interface GainXpUseCaseRequest {
  characterId: string
  xpAmount: number
}

type GainXpUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    levelsGained: number
    newLevel: number
    awakened: boolean
    awakenedPowerName?: string
  }
>

export class GainXpUseCase {
  constructor(
    private characterRepository: ICharacterRepository,
    private powerRepository: IPowerRepository,
    private powerAwakeningRepository: IPowerAwakeningRepository
  ) {}

  async execute({
    characterId,
    xpAmount,
  }: GainXpUseCaseRequest): Promise<GainXpUseCaseResponse> {
    const character = await this.characterRepository.findById(characterId)
    if (!character) return left(new ResourceNotFoundError('Character'))

    const power = await this.powerRepository.findById(character.powerId)
    if (!power) return left(new ResourceNotFoundError('Power'))

    const oldLevel = character.level
    const levelsGained = character.gainXp(xpAmount)

    let awakened = false
    let awakenedPowerName: string | undefined

    const canTryAwaken =
      power.canAwaken &&
      !character.awakenedPowerId &&
      !character.secondaryPowerId // dual power blocks awakening

    if (canTryAwaken && levelsGained > 0) {
      const awakeningTriggerLevels: number[] = []
      for (let lvl = oldLevel + 1; lvl <= character.level; lvl++) {
        if (lvl >= 20 && lvl % 5 === 0) {
          awakeningTriggerLevels.push(lvl)
        }
      }

      for (const _lvl of awakeningTriggerLevels) {
        if (Math.random() < AWAKEN_CHANCE) {
          const options =
            await this.powerAwakeningRepository.findByBasePowerId(
              character.powerId
            )
          if (options.length === 0) break
          const chosen = options[Math.floor(Math.random() * options.length)]!
          const awakenedPower = await this.powerRepository.findById(chosen.awakenedPowerId)
          if (!awakenedPower) break
          character.awakenedPowerId = chosen.awakenedPowerId
          awakened = true
          awakenedPowerName = awakenedPower.name
          break
        }
      }
    }

    await this.characterRepository.save(character)

    return right({
      levelsGained,
      newLevel: character.level,
      awakened,
      ...(awakenedPowerName !== undefined ? { awakenedPowerName } : {}),
    })
  }
}
