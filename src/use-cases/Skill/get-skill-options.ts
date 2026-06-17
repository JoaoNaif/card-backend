import { left, right, type Either } from '../../core/either'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'
import { UnauthorizedError } from '../../core/error/err/unauthorized-error'
import type { ICharacterRepository } from '../../repositories/interface/character-repository'
import type { ICharacterSkillRepository } from '../../repositories/interface/character-skill-repository'
import type { ISkillRepository } from '../../repositories/interface/skill-repository'
import type { IUserRepository } from '../../repositories/interface/user-repository'
import type { DtoSkillRaw } from './dtos/dto-skill-raw'
import { UnavailabelSkillOptionsError } from './err/unavailable-skills-options-error'

const SKILL_OPTIONS_COUNT = 3

interface GetSkillOptionsUseCaseRequest {
  userId: string
  characterId: string
}

type GetSkillOptionsUseCaseResponse = Either<
  ResourceNotFoundError | UnauthorizedError | UnavailabelSkillOptionsError,
  { options: DtoSkillRaw[] }
>

export class GetSkillOptionsUseCase {
  constructor(
    private characterRepository: ICharacterRepository,
    private userRepository: IUserRepository,
    private skillRepository: ISkillRepository,
    private characterSkillRepository: ICharacterSkillRepository
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

    const options: DtoSkillRaw[] = pickRandom(pool, SKILL_OPTIONS_COUNT).map(
      (skill) => ({
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
        createdAt: skill.createdAt,
      })
    )

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
