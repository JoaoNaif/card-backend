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
        cost: skill.cost,
        limitation: skill.limitation,
        minLevel: skill.minLevel,
        powerId: skill.powerId,
        createdAt: skill.createdAt,
      })),
    })
  }
}
