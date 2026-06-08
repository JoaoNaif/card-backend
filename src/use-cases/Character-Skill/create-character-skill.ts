import { left, right, type Either } from '../../core/either'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'
import { ResourceAlreadyExistError } from '../../core/error/err/resource-already-exist-error'
import { UnauthorizedError } from '../../core/error/err/unauthorized-error'
import type { ISkillRepository } from '../../repositories/interface/skill-repository'
import type { ICharacterRepository } from '../../repositories/interface/character-repository'
import type { DtoCharacterSkillRaw } from './dtos/dto-character-skill-raw'
import type { ICharacterSkillRepository } from '../../repositories/interface/character-skill-repository'
import { CharacterSkill } from '../../entities/character-skill'

interface CreateCharacterSkillUseCaseRequest {
  userId: string
  characterId: string
  skillId: string
  assignedAt: Date
}

type CreateCharacterSkillUseCaseResponse = Either<
  ResourceAlreadyExistError | ResourceNotFoundError | UnauthorizedError,
  {
    characterSkill: DtoCharacterSkillRaw
  }
>

export class CreateCharacterSkillUseCase {
  constructor(
    private characterSkillRepository: ICharacterSkillRepository,
    private skillRepository: ISkillRepository,
    private characterRepository: ICharacterRepository
  ) {}

  async execute({
    userId,
    assignedAt,
    characterId,
    skillId,
  }: CreateCharacterSkillUseCaseRequest): Promise<CreateCharacterSkillUseCaseResponse> {
    const skill = await this.skillRepository.findById(skillId)

    if (!skill) {
      return left(new ResourceNotFoundError('Skill'))
    }

    const character = await this.characterRepository.findById(characterId)

    if (!character) {
      return left(new ResourceNotFoundError('Character'))
    }

    if (character.userId !== userId) {
      return left(new UnauthorizedError())
    }

    const existingCharacterSkill = await this.characterSkillRepository.findByIds(
      characterId,
      skillId
    )

    if (existingCharacterSkill) {
      return left(new ResourceAlreadyExistError('CharacterSkill'))
    }

    const characterskill = CharacterSkill.create({
      assignedAt,
      characterId,
      skillId,
    })

    await this.characterSkillRepository.create(characterskill)

    return right({
      characterSkill: {
        id: characterskill.id.toString(),
        characterId: characterskill.characterId,
        skillId: characterskill.skillId,
        assignedAt: characterskill.assignedAt,
      },
    })
  }
}
