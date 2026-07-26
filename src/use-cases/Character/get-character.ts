import { left, right, type Either } from '../../core/either'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'
import type { IBattleFieldRepository } from '../../repositories/interface/battle-field-repository'
import type { ICharacterRepository } from '../../repositories/interface/character-repository'
import type { ICharacterSkillRepository } from '../../repositories/interface/character-skill-repository'
import type { IPowerRepository } from '../../repositories/interface/power-repository'
import type { ISkillRepository } from '../../repositories/interface/skill-repository'
import type { DtoPowerRaw } from '../Power/dtos/dto-power-raw'
import type { DtoSkillAndPower } from '../Skill/dtos/dto-skill-and-power'
import type { DtoCharacterFull } from './dtos/dto-character-full'

interface GetCharacterUseCaseRequest {
  characterId: string
}

type GetCharacterUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    character: DtoCharacterFull
  }
>

export class GetCharacterUseCase {
  constructor(
    private characterRepository: ICharacterRepository,
    private powerRepository: IPowerRepository,
    private characterSkillRepository: ICharacterSkillRepository,
    private skillRepository: ISkillRepository,
    private battleFieldRepository: IBattleFieldRepository
  ) {}

  async execute({
    characterId,
  }: GetCharacterUseCaseRequest): Promise<GetCharacterUseCaseResponse> {
    const character = await this.characterRepository.findById(characterId)

    if (!character) return left(new ResourceNotFoundError('Character'))

    const power = await this.powerRepository.findById(character.powerId)

    if (!power) return left(new ResourceNotFoundError('Power'))

    const toPowerRaw = (p: typeof power): DtoPowerRaw => ({
      id: p.id.toString(),
      name: p.name,
      description: p.description,
      pillar: p.pillar,
      canAwaken: p.canAwaken,
      isAwakened: p.isAwakened,
      createdAt: p.createdAt,
    })

    let secondaryPowerDto: DtoPowerRaw | null | undefined = null
    if (character.secondaryPowerId) {
      const secondaryPower = await this.powerRepository.findById(
        character.secondaryPowerId
      )
      if (!secondaryPower)
        return left(new ResourceNotFoundError('SecondaryPower'))
      secondaryPowerDto = toPowerRaw(secondaryPower)
    }

    let awakenedPowerDto: DtoPowerRaw | null | undefined = null
    if (character.awakenedPowerId) {
      const awakenedPower = await this.powerRepository.findById(
        character.awakenedPowerId
      )
      if (!awakenedPower)
        return left(new ResourceNotFoundError('AwakenedPower'))
      awakenedPowerDto = toPowerRaw(awakenedPower)
    }

    const characterSkills =
      await this.characterSkillRepository.findAllByCharacterId(
        character.id.toString()
      )

    const characterSkillEntities = (
      await Promise.all(
        characterSkills.map((cs) => this.skillRepository.findById(cs.skillId))
      )
    ).filter((s) => s !== null)

    const skills: DtoSkillAndPower[] = []

    for (const s of characterSkillEntities) {
      const skillPower = await this.powerRepository.findById(s.powerId)

      if (!skillPower) {
        return left(new ResourceNotFoundError('Power'))
      }

      let skillBattleField = null

      if (s.appliesBattleFieldId) {
        skillBattleField = await this.battleFieldRepository.findById(
          s.appliesBattleFieldId
        )

        if (!skillBattleField) {
          return left(new ResourceNotFoundError('Battle field'))
        }
      }

      skills.push({
        id: s.id.toString(),
        name: s.name,
        description: s.description,
        limitation: s.limitation,
        cooldownTurns: s.cooldownTurns,
        debuffDuration: s.debuffDuration,
        debuffStat: s.debuffStat,
        debuffValue: s.debuffValue,
        minLevel: s.minLevel,
        powerId: s.powerId,
        appliesBattleFieldId: s.appliesBattleFieldId ?? null,
        fieldDuration: s.fieldDuration ?? null,
        damageMultiplier: s.damageMultiplier,
        healMultiplier: s.healMultiplier,
        targetType: s.targetType,
        targetEffectDuration: s.targetEffectDuration ?? null,
        targetEffectStat: s.targetEffectStat ?? null,
        targetEffectValue: s.targetEffectValue ?? null,
        createdAt: s.createdAt,
        power: toPowerRaw(skillPower),
        battleField: skillBattleField
          ? {
              id: skillBattleField.id.toString(),
              name: skillBattleField.name,
              description: skillBattleField.description,
              modifiers: skillBattleField.modifiers.map((mod) => ({
                id: mod.id,
                traitName: mod.traitName,
                traitId: mod.traitId,
                bonusType: mod.bonusType,
                bonusValue: mod.bonusValue,
                stat: mod.stat,
              })),
              createdAt: skillBattleField.createdAt,
            }
          : null,
      })
    }

    return right({
      character: {
        id: character.id.toString(),
        name: character.name,
        description: character.description,
        level: character.level,
        ranking: character.ranking,
        maxRanking: character.maxRanking,
        breakthroughAttempts: character.breakthroughAttempts,
        xp: character.xp,
        atk: character.effectiveAtk,
        def: character.effectiveDef,
        hp: character.effectiveHp,
        spd: character.effectiveSpd,
        pendingSkillSelections: character.pendingSkillSelections,
        userId: character.userId,
        power: toPowerRaw(power),
        secondaryPower: secondaryPowerDto,
        awakenedPower: awakenedPowerDto,
        traits: character.traits,
        skills,
        createdAt: character.createdAt,
      },
    })
  }
}
