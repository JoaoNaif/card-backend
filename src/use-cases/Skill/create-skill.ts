import { left, right, type Either } from '../../core/either'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'
import { ResourceAlreadyExistError } from '../../core/error/err/resource-already-exist-error'
import { UnauthorizedError } from '../../core/error/err/unauthorized-error'
import { Skill, StatType, TargetType } from '../../entities/skill'
import type { IBattleFieldRepository } from '../../repositories/interface/battle-field-repository'
import type { IPowerRepository } from '../../repositories/interface/power-repository'
import type { ISkillRepository } from '../../repositories/interface/skill-repository'
import type { IUserRepository } from '../../repositories/interface/user-repository'
import type { DtoSkillRaw } from './dtos/dto-skill-raw'

interface CreateSkillUseCaseRequest {
  userId: string
  name: string
  description: string
  limitation: string
  cooldownTurns: number
  debuffStat: StatType
  debuffValue: number
  debuffDuration: number
  targetType?: TargetType
  damageMultiplier?: number
  healMultiplier?: number
  targetEffectStat?: StatType | null
  targetEffectValue?: number | null
  targetEffectDuration?: number | null
  minLevel: number
  powerId: string
  appliesBattleFieldId?: string | null
  fieldDuration?: number | null
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
    private powerRepository: IPowerRepository,
    private battleFieldRepository: IBattleFieldRepository
  ) {}

  async execute({
    userId,
    name,
    description,
    limitation,
    cooldownTurns,
    debuffDuration,
    debuffStat,
    debuffValue,
    targetType,
    damageMultiplier,
    healMultiplier,
    targetEffectStat,
    targetEffectValue,
    targetEffectDuration,
    minLevel,
    powerId,
    appliesBattleFieldId,
    fieldDuration,
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

    let battleField = null

    if (appliesBattleFieldId) {
      battleField =
        await this.battleFieldRepository.findById(appliesBattleFieldId)

      if (!battleField) {
        return left(new ResourceNotFoundError('Battle field'))
      }
    }

    const skill = Skill.create({
      name,
      description,
      limitation,
      minLevel,
      cooldownTurns,
      debuffDuration,
      debuffStat,
      debuffValue,
      targetType,
      damageMultiplier,
      healMultiplier,
      targetEffectStat: targetEffectStat ?? null,
      targetEffectValue: targetEffectValue ?? null,
      targetEffectDuration: targetEffectDuration ?? null,
      powerId: power.id.toString(),
      appliesBattleFieldId: battleField?.id.toString() ?? null,
      fieldDuration: fieldDuration ?? null,
    })

    await this.skillRepository.create(skill)

    return right({
      skill: {
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
      },
    })
  }
}
