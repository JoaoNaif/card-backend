import { left, right, type Either } from '../../core/either'
import { ResourceAlreadyExistError } from '../../core/error/err/resource-already-exist-error'
import type { IUserRepository } from '../../repositories/interface/user-repository'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'
import type { IPowerRepository } from '../../repositories/interface/power-repository'
import { UnauthorizedError } from '../../core/error/err/unauthorized-error'
import type { StatType, TargetType } from '../../entities/skill'
import type { ISkillRepository } from '../../repositories/interface/skill-repository'
import type { IBattleFieldRepository } from '../../repositories/interface/battle-field-repository'

interface EditSkillUseCaseRequest {
  adminId: string
  skillId: string
  name?: string
  description?: string
  limitation?: string
  cooldownTurns?: number
  debuffStat?: StatType
  debuffValue?: number
  debuffDuration?: number
  targetType?: TargetType
  damageMultiplier?: number
  healMultiplier?: number
  targetEffectStat?: StatType | null
  targetEffectValue?: number | null
  targetEffectDuration?: number | null
  minLevel?: number
  powerId?: string
  appliesBattleFieldId?: string | null
  fieldDuration?: number | null
}

type EditSkillUseCaseResponse = Either<
  ResourceAlreadyExistError | ResourceNotFoundError | UnauthorizedError,
  null
>
export class EditSkillUseCase {
  constructor(
    private userRepository: IUserRepository,
    private skillRepository: ISkillRepository,
    private battleFieldRepository: IBattleFieldRepository,
    private powerRepository: IPowerRepository
  ) {}

  async execute({
    adminId,
    powerId,
    name,
    description,
    skillId,
    appliesBattleFieldId,
    cooldownTurns,
    damageMultiplier,
    debuffDuration,
    debuffStat,
    debuffValue,
    fieldDuration,
    healMultiplier,
    limitation,
    minLevel,
    targetEffectDuration,
    targetEffectStat,
    targetEffectValue,
    targetType,
  }: EditSkillUseCaseRequest): Promise<EditSkillUseCaseResponse> {
    const user = await this.userRepository.findById(adminId)

    if (!user) return left(new ResourceNotFoundError('User'))

    if (!user.isAdmin()) return left(new UnauthorizedError())

    const skill = await this.skillRepository.findById(skillId)

    if (!skill) return left(new ResourceNotFoundError('Skill'))

    if (powerId) {
      const power = await this.powerRepository.findById(powerId)

      if (!power) return left(new ResourceNotFoundError('Power'))

      skill.powerId = powerId
    }

    if (appliesBattleFieldId) {
      const battleField =
        await this.battleFieldRepository.findById(appliesBattleFieldId)

      if (!battleField) return left(new ResourceNotFoundError('Battle field'))

      skill.appliesBattleFieldId = appliesBattleFieldId
    }

    if (name) {
      const newName = await this.skillRepository.findByName(name)

      if (newName) return left(new ResourceAlreadyExistError('Name'))

      skill.name = name
    }

    skill.description = description ?? skill.description
    skill.limitation = limitation ?? skill.limitation
    skill.cooldownTurns = cooldownTurns ?? skill.cooldownTurns
    skill.damageMultiplier = damageMultiplier ?? skill.damageMultiplier
    skill.debuffDuration = debuffDuration ?? skill.debuffDuration
    skill.debuffStat = debuffStat ?? skill.debuffStat
    skill.debuffValue = debuffValue ?? skill.debuffValue
    skill.fieldDuration = fieldDuration ?? skill.fieldDuration
    skill.healMultiplier = healMultiplier ?? skill.healMultiplier
    skill.minLevel = minLevel ?? skill.minLevel
    skill.targetEffectDuration =
      targetEffectDuration ?? skill.targetEffectDuration
    skill.targetEffectStat = targetEffectStat ?? skill.targetEffectStat
    skill.targetEffectValue = targetEffectValue ?? skill.targetEffectValue
    skill.targetType = targetType ?? skill.targetType

    await this.skillRepository.save(skill)

    return right(null)
  }
}
