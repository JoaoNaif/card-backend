import { left, right, type Either } from '../../core/either'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'
import { ResourceAlreadyExistError } from '../../core/error/err/resource-already-exist-error'
import { UnauthorizedError } from '../../core/error/err/unauthorized-error'
import { Skill } from '../../entities/skill'
import type { IPowerRepository } from '../../repositories/interface/power-repository'
import type { ISkillRepository } from '../../repositories/interface/skill-repository'
import type { IUserRepository } from '../../repositories/interface/user-repository'
import type { DtoSkillRaw } from './dtos/dto-skill-raw'

interface CreateSkillUseCaseRequest {
  userId: string
  name: string
  description: string
  limitation: string
  cost: number
  minLevel: number
  powerId: string
}

type CreateSkillUseCaseResponse = Either<
  ResourceAlreadyExistError | ResourceNotFoundError | UnauthorizedError,
  {
    skill: DtoSkillRaw
  }
>

export class CreateSkillUseCase {
  constructor(
    private skillRepository: ISkillRepository,
    private userRepository: IUserRepository,
    private powerRepository: IPowerRepository
  ) {}

  async execute({
    userId,
    name,
    description,
    cost,
    limitation,
    minLevel,
    powerId,
  }: CreateSkillUseCaseRequest): Promise<CreateSkillUseCaseResponse> {
    const user = await this.userRepository.findById(userId)

    if (!user) {
      return left(new ResourceNotFoundError('User'))
    }

    if (!user.isAdmin()) {
      return left(new UnauthorizedError())
    }

    const skillAlreadyExists = await this.skillRepository.findByName(name)

    if (skillAlreadyExists) {
      return left(new ResourceAlreadyExistError('Skill'))
    }

    const power = await this.powerRepository.findById(powerId)

    if (!power) {
      return left(new ResourceNotFoundError('Power'))
    }

    const skill = Skill.create({
      name,
      description,
      cost,
      limitation,
      minLevel,
      powerId: power.id.toString(),
    })

    await this.skillRepository.create(skill)

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
      },
    })
  }
}
