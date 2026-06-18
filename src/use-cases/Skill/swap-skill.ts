import { left, right, type Either } from '../../core/either'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'
import { UnauthorizedError } from '../../core/error/err/unauthorized-error'
import { CharacterSkill } from '../../entities/character-skill'
import type { ICharacterRepository } from '../../repositories/interface/character-repository'
import type { ICharacterSkillRepository } from '../../repositories/interface/character-skill-repository'
import type { ISkillRepository } from '../../repositories/interface/skill-repository'
import type { IUserRepository } from '../../repositories/interface/user-repository'
import { SkillNotFullError } from './err/skill-not-full-error'

interface SwapSkillUseCaseRequest {
  userId: string
  characterId: string
  currentSkillId: string
  newSkillId: string
}

type SwapSkillUseCaseResponse = Either<
  ResourceNotFoundError | UnauthorizedError | SkillNotFullError,
  null
>

export class SwapSkillUseCase {
  constructor(
    private characterRepository: ICharacterRepository,
    private userRepository: IUserRepository,
    private skillRepository: ISkillRepository,
    private characterSkillRepository: ICharacterSkillRepository
  ) {}

  async execute({
    characterId,
    userId,
    currentSkillId,
    newSkillId,
  }: SwapSkillUseCaseRequest): Promise<SwapSkillUseCaseResponse> {
    const user = await this.userRepository.findById(userId)

    if (!user) return left(new ResourceNotFoundError('User'))

    const character = await this.characterRepository.findById(characterId)

    if (!character) return left(new ResourceNotFoundError('Character'))

    if (character.userId !== user.id.toString())
      return left(new UnauthorizedError())

    const quantitySkills =
      await this.characterSkillRepository.findAllByCharacterId(characterId)

    if (quantitySkills.length !== 4) return left(new SkillNotFullError())

    const currentSkill = await this.skillRepository.findById(currentSkillId)

    if (!currentSkill) return left(new ResourceNotFoundError('Current Skill'))

    const characterCurrentSkill = await this.characterSkillRepository.findByIds(
      characterId,
      currentSkillId
    )

    if (!characterCurrentSkill)
      return left(new ResourceNotFoundError('Current Skill'))

    const newSkill = await this.skillRepository.findById(newSkillId)

    if (!newSkill) return left(new ResourceNotFoundError('New Skill'))

    const newSkillBelongsToCharacter =
      newSkill.powerId === character.powerId ||
      newSkill.powerId === character.secondaryPowerId

    if (!newSkillBelongsToCharacter) return left(new UnauthorizedError())

    await this.characterSkillRepository.delete(characterCurrentSkill)

    const newCharacterSkill = CharacterSkill.create({
      characterId,
      skillId: newSkillId,
    })

    await this.characterSkillRepository.create(newCharacterSkill)

    return right(null)
  }
}
