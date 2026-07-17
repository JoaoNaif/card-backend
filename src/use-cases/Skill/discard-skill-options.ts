import { left, right, type Either } from '../../core/either'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'
import { UnauthorizedError } from '../../core/error/err/unauthorized-error'
import type { ICharacterRepository } from '../../repositories/interface/character-repository'
import type { IPendingSkillChoiceRepository } from '../../repositories/interface/pending-skill-choice-repository'
import type { IUserRepository } from '../../repositories/interface/user-repository'
import { UnavailabelSkillOptionsError } from './err/unavailable-skills-options-error'

interface DiscardSkillOptionsUseCaseRequest {
  userId: string
  characterId: string
}

type DiscardSkillOptionsUseCaseResponse = Either<
  ResourceNotFoundError | UnauthorizedError | UnavailabelSkillOptionsError,
  null
>

export class DiscardSkillOptionsUseCase {
  constructor(
    private characterRepository: ICharacterRepository,
    private userRepository: IUserRepository,
    private pendingSkillChoiceRepository: IPendingSkillChoiceRepository
  ) {}

  async execute({
    userId,
    characterId,
  }: DiscardSkillOptionsUseCaseRequest): Promise<DiscardSkillOptionsUseCaseResponse> {
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

    openPending.resolvedAt = new Date()
    await this.pendingSkillChoiceRepository.save(openPending)

    character.pendingSkillSelections -= 1
    await this.characterRepository.save(character)

    return right(null)
  }
}
