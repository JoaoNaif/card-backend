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
        minLevel: skill.minLevel,
        powerId: skill.powerId,
        appliesBattleFieldId: skill.appliesBattleFieldId ?? null,
        fieldDuration: skill.fieldDuration ?? null,
        createdAt: skill.createdAt,
      })),
    })
  }
}
