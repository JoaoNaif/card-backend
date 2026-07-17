import { left, right, type Either } from '../../core/either'
import { ResourceAlreadyExistError } from '../../core/error/err/resource-already-exist-error'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'
import { UnauthorizedError } from '../../core/error/err/unauthorized-error'
import { CharacterSkill } from '../../entities/character-skill'
import type { ICharacterRepository } from '../../repositories/interface/character-repository'
import type { ICharacterSkillRepository } from '../../repositories/interface/character-skill-repository'
import type { IPendingSkillChoiceRepository } from '../../repositories/interface/pending-skill-choice-repository'
import type { ISkillRepository } from '../../repositories/interface/skill-repository'
import type { IUserRepository } from '../../repositories/interface/user-repository'
import type { DtoCharacterSkillRaw } from '../Character-Skill/dtos/dto-character-skill-raw'
import { SlotSkillFullError } from '../Character-Skill/err/slot-skill-full-error'
import { InvalidSkillOptionError } from './err/invalid-skill-option-error'
import { UnavailabelSkillOptionsError } from './err/unavailable-skills-options-error'

interface ResolveSkillOptionUseCaseRequest {
  userId: string
  characterId: string
  skillId: string
}

type ResolveSkillOptionUseCaseResponse = Either<
  | ResourceNotFoundError
  | UnauthorizedError
  | UnavailabelSkillOptionsError
  | InvalidSkillOptionError
  | ResourceAlreadyExistError
  | SlotSkillFullError,
  { characterSkill: DtoCharacterSkillRaw }
>

export class ResolveSkillOptionUseCase {
  constructor(
    private characterRepository: ICharacterRepository,
    private userRepository: IUserRepository,
    private skillRepository: ISkillRepository,
    private characterSkillRepository: ICharacterSkillRepository,
    private pendingSkillChoiceRepository: IPendingSkillChoiceRepository
  ) {}

  async execute({
    userId,
    characterId,
    skillId,
  }: ResolveSkillOptionUseCaseRequest): Promise<ResolveSkillOptionUseCaseResponse> {
    const user = await this.userRepository.findById(userId)
    if (!user) return left(new ResourceNotFoundError('User'))

    const character = await this.characterRepository.findById(characterId)
    if (!character) return left(new ResourceNotFoundError('Character'))

    if (character.userId !== user.id.toString())
      return left(new UnauthorizedError())

    const openPending =
      await this.pendingSkillChoiceRepository.findOpenByCharacterId(
        characterId
      )
    if (!openPending) return left(new UnavailabelSkillOptionsError())

    if (!openPending.optionSkillIds.includes(skillId)) {
      return left(new InvalidSkillOptionError())
    }

    const existingCharacterSkill =
      await this.characterSkillRepository.findByIds(characterId, skillId)
    if (existingCharacterSkill) {
      return left(new ResourceAlreadyExistError('CharacterSkill'))
    }

    const currentSkills =
      await this.characterSkillRepository.findAllByCharacterId(characterId)
    if (currentSkills.length >= 4) return left(new SlotSkillFullError())

    const skill = await this.skillRepository.findById(skillId)
    if (!skill) return left(new ResourceNotFoundError('Skill'))

    const characterSkill = CharacterSkill.create({ characterId, skillId })
    await this.characterSkillRepository.create(characterSkill)

    openPending.chosenSkillId = skillId
    openPending.resolvedAt = new Date()
    await this.pendingSkillChoiceRepository.save(openPending)

    character.pendingSkillSelections -= 1
    await this.characterRepository.save(character)

    return right({
      characterSkill: {
        id: characterSkill.id.toString(),
        characterId: characterSkill.characterId,
        skillId: characterSkill.skillId,
        assignedAt: characterSkill.assignedAt,
      },
    })
  }
}
