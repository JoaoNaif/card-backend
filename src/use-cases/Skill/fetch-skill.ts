import { left, right, type Either } from '../../core/either'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'
import type { IBattleFieldRepository } from '../../repositories/interface/battle-field-repository'
import type { IPowerRepository } from '../../repositories/interface/power-repository'
import type { ISkillRepository } from '../../repositories/interface/skill-repository'
import type { DtoSkillAndPower } from './dtos/dto-skill-and-power'

interface FetchSkillUseCaseRequest {
  search: string
  page: number
  limit: number
}

type FetchSkillUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    skills: DtoSkillAndPower[]
  }
>

export class FetchSkillUseCase {
  constructor(
    private skillRepository: ISkillRepository,
    private powerRepository: IPowerRepository,
    private battleFieldRepository: IBattleFieldRepository
  ) {}

  async execute({
    limit,
    page,
    search,
  }: FetchSkillUseCaseRequest): Promise<FetchSkillUseCaseResponse> {
    const skills = await this.skillRepository.findAll(search, page, limit)

    const dtos: DtoSkillAndPower[] = []

    for (const skill of skills) {
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

      dtos.push({
        id: skill.id.toString(),
        name: skill.name,
        description: skill.description,
        limitation: skill.limitation,
        cooldownTurns: skill.cooldownTurns,
        debuffStat: skill.debuffStat,
        debuffValue: skill.debuffValue,
        debuffDuration: skill.debuffDuration,
        targetType: skill.targetType,
        damageMultiplier: skill.damageMultiplier,
        healMultiplier: skill.healMultiplier,
        targetEffectStat: skill.targetEffectStat ?? null,
        targetEffectValue: skill.targetEffectValue ?? null,
        targetEffectDuration: skill.targetEffectDuration ?? null,
        minLevel: skill.minLevel,
        powerId: skill.powerId,
        appliesBattleFieldId: skill.appliesBattleFieldId ?? null,
        fieldDuration: skill.fieldDuration ?? null,
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
                traitName: mod.traitId,
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

    return right({ skills: dtos })
  }
}
