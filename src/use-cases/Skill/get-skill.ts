import { left, right, type Either } from '../../core/either'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'
import type { IPowerRepository } from '../../repositories/interface/power-repository'
import type { ISkillRepository } from '../../repositories/interface/skill-repository'
import type { DtoSkillAndPower } from './dtos/dto-skill-and-power'

interface GetSkillUseCaseRequest {
  skillId: string
}

type GetSkillUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    skill: DtoSkillAndPower
  }
>

export class GetSkillUseCase {
  constructor(
    private skillRepository: ISkillRepository,
    private powerRepository: IPowerRepository
  ) {}

  async execute({
    skillId,
  }: GetSkillUseCaseRequest): Promise<GetSkillUseCaseResponse> {
    const skill = await this.skillRepository.findById(skillId)

    if (!skill) {
      return left(new ResourceNotFoundError('Skill'))
    }

    const power = await this.powerRepository.findById(skill.powerId)

    if (!power) {
      return left(new ResourceNotFoundError('Power'))
    }

    return right({
      skill: {
        id: skill.id.toString(),
        name: skill.name,
        description: skill.description,
        cost: skill.cost,
        limitation: skill.limitation,
        minLevel: skill.minLevel,
        powerId: skill.powerId,
        createdAt: skill.createdAt,
        power: {
          id: power.id.toString(),
          name: power.name,
          description: power.description,
          createdAt: power.createdAt,
        },
      },
    })
  }
}
