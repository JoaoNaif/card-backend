import { right, type Either } from '../../core/either'
import type { ISkillRepository } from '../../repositories/interface/skill-repository'
import type { DtoSkillRaw } from './dtos/dto-skill-raw'

interface FetchSkillUseCaseRequest {
  search: string
  page: number
  limit: number
}

type FetchSkillUseCaseResponse = Either<
  null,
  {
    skills: DtoSkillRaw[]
  }
>

export class FetchSkillUseCase {
  constructor(private skillRepository: ISkillRepository) {}

  async execute({
    limit,
    page,
    search,
  }: FetchSkillUseCaseRequest): Promise<FetchSkillUseCaseResponse> {
    const skills = await this.skillRepository.findAll(search, page, limit)

    return right({
      skills: skills.map((skill) => ({
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
      })),
    })
  }
}
