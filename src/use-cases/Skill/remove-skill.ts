import { left, right, type Either } from '../../core/either'
import type { IUserRepository } from '../../repositories/interface/user-repository'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'
import { UnauthorizedError } from '../../core/error/err/unauthorized-error'
import type { ISkillRepository } from '../../repositories/interface/skill-repository'

interface RemoveSkillUseCaseRequest {
  skillId: string
  adminId: string
}

type RemoveSkillUseCaseResponse = Either<
  ResourceNotFoundError | UnauthorizedError,
  null
>
export class RemoveSkillUseCase {
  constructor(
    private userRepository: IUserRepository,
    private skillRepository: ISkillRepository
  ) {}

  async execute({
    adminId,
    skillId,
  }: RemoveSkillUseCaseRequest): Promise<RemoveSkillUseCaseResponse> {
    const user = await this.userRepository.findById(adminId)

    if (!user) return left(new ResourceNotFoundError('Email'))

    if (!user.isAdmin()) return left(new UnauthorizedError())

    const skill = await this.skillRepository.findById(skillId)

    if (!skill) return left(new ResourceNotFoundError('Skill'))

    await this.skillRepository.delete(skill)

    return right(null)
  }
}
