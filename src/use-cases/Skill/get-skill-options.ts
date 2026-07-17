import { left, right, type Either } from '../../core/either'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'
import { UnauthorizedError } from '../../core/error/err/unauthorized-error'
import { PendingSkillChoice } from '../../entities/pending-skill-choice'
import type { Skill } from '../../entities/skill'
import type { IBattleFieldRepository } from '../../repositories/interface/battle-field-repository'
import type { ICharacterRepository } from '../../repositories/interface/character-repository'
import type { ICharacterSkillRepository } from '../../repositories/interface/character-skill-repository'
import type { IPendingSkillChoiceRepository } from '../../repositories/interface/pending-skill-choice-repository'
import type { IPowerRepository } from '../../repositories/interface/power-repository'
import type { ISkillRepository } from '../../repositories/interface/skill-repository'
import type { IUserRepository } from '../../repositories/interface/user-repository'
import type { DtoSkillAndPower } from './dtos/dto-skill-and-power'
import { UnavailabelSkillOptionsError } from './err/unavailable-skills-options-error'

const SKILL_OPTIONS_COUNT = 3

interface GetSkillOptionsUseCaseRequest {
  userId: string
  characterId: string
}

type GetSkillOptionsUseCaseResponse = Either<
  ResourceNotFoundError | UnauthorizedError | UnavailabelSkillOptionsError,
  { options: DtoSkillAndPower[] }
>

export class GetSkillOptionsUseCase {
  constructor(
    private characterRepository: ICharacterRepository,
    private userRepository: IUserRepository,
    private skillRepository: ISkillRepository,
    private characterSkillRepository: ICharacterSkillRepository,
    private powerRepository: IPowerRepository,
    private battleFieldRepository: IBattleFieldRepository,
    private pendingSkillChoiceRepository: IPendingSkillChoiceRepository
  ) {}

  async execute({
    characterId,
    userId,
  }: GetSkillOptionsUseCaseRequest): Promise<GetSkillOptionsUseCaseResponse> {
    const user = await this.userRepository.findById(userId)
    if (!user) return left(new ResourceNotFoundError('User'))

    const character = await this.characterRepository.findById(characterId)
    if (!character) return left(new ResourceNotFoundError('Character'))

    if (character.userId !== user.id.toString())
      return left(new UnauthorizedError())

    if (character.pendingSkillSelections <= 0) {
      return left(new UnavailabelSkillOptionsError())
    }

    const openPending =
      await this.pendingSkillChoiceRepository.findOpenByCharacterId(
        characterId
      )

    let picked: Skill[]

    if (openPending) {
      picked = []
      for (const skillId of openPending.optionSkillIds) {
        const skill = await this.skillRepository.findById(skillId)
        if (!skill) return left(new ResourceNotFoundError('Skill'))
        picked.push(skill)
      }
    } else {
      const currentSkills =
        await this.characterSkillRepository.findAllByCharacterId(characterId)
      const excludeSkillIds = currentSkills.map((cs) => cs.skillId)

      const powerIds = [
        character.powerId,
        character.secondaryPowerId,
        character.awakenedPowerId,
      ].filter((id): id is string => typeof id === 'string')

      const pool = await this.skillRepository.findEligibleForCharacter(
        powerIds,
        character.level,
        excludeSkillIds
      )

      if (pool.length === 0) return left(new UnavailabelSkillOptionsError())

      picked = pickRandom(pool, SKILL_OPTIONS_COUNT)

      const newPending = PendingSkillChoice.create({
        characterId,
        optionSkillIds: picked.map((skill) => skill.id.toString()),
      })
      await this.pendingSkillChoiceRepository.create(newPending)
    }

    const options: DtoSkillAndPower[] = []

    for (const skill of picked) {
      const power = await this.powerRepository.findById(skill.powerId)

      if (!power) {
        return left(new ResourceNotFoundError('Power'))
      }

      let battleField = null

      if (skill.appliesBattleFieldId) {
        battleField = await this.battleFieldRepository.findById(
          skill.appliesBattleFieldId
        )

        if (!battleField) {
          return left(new ResourceNotFoundError('Battle field'))
        }
      }

      options.push({
        id: skill.id.toString(),
        name: skill.name,
        description: skill.description,
        limitation: skill.limitation,
        cooldownTurns: skill.cooldownTurns,
        debuffDuration: skill.debuffDuration,
        debuffStat: skill.debuffStat,
        debuffValue: skill.debuffValue,
        minLevel: skill.minLevel,
        powerId: skill.powerId,
        appliesBattleFieldId: skill.appliesBattleFieldId ?? null,
        fieldDuration: skill.fieldDuration ?? null,
        damageMultiplier: skill.damageMultiplier,
        healMultiplier: skill.healMultiplier,
        targetType: skill.targetType,
        targetEffectDuration: skill.targetEffectDuration ?? null,
        targetEffectStat: skill.targetEffectStat ?? null,
        targetEffectValue: skill.targetEffectValue ?? null,
        createdAt: skill.createdAt,
        power: {
          id: power.id.toString(),
          name: power.name,
          description: power.description,
          pillar: power.pillar,
          canAwaken: power.canAwaken,
          isAwakened: power.isAwakened,
          createdAt: power.createdAt,
        },
        battleField: battleField
          ? {
              id: battleField.id.toString(),
              name: battleField.name,
              description: battleField.description,
              modifiers: battleField.modifiers.map((mod) => ({
                id: mod.id,
                traitName: mod.traitName,
                traitId: mod.traitId,
                bonusType: mod.bonusType,
                bonusValue: mod.bonusValue,
                stat: mod.stat,
              })),
              createdAt: battleField.createdAt,
            }
          : null,
      })
    }

    return right({ options })
  }
}

function pickRandom<T>(pool: T[], count: number): T[] {
  const result = [...pool]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j]!, result[i]!]
  }
  return result.slice(0, count)
}
