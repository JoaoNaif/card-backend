import { left, right, type Either } from '../../core/either'
import { ResourceAlreadyExistError } from '../../core/error/err/resource-already-exist-error'
import type { IUserRepository } from '../../repositories/interface/user-repository'
import { ResourceNotFoundError } from '../../core/error/err/not-found-error'
import { UnauthorizedError } from '../../core/error/err/unauthorized-error'
import type { ICharacterRepository } from '../../repositories/interface/character-repository'
import type { Ranking } from '../../entities/character'

interface EditCharacterUseCaseRequest {
  adminId: string
  characterId: string
  name?: string
  description?: string
  ranking?: Ranking
}

type EditCharacterUseCaseResponse = Either<
  ResourceAlreadyExistError | ResourceNotFoundError | UnauthorizedError,
  null
>
export class EditCharacterUseCase {
  constructor(
    private userRepository: IUserRepository,
    private characterRepository: ICharacterRepository
  ) {}

  async execute({
    adminId,
    name,
    description,
    characterId,
    ranking,
  }: EditCharacterUseCaseRequest): Promise<EditCharacterUseCaseResponse> {
    const user = await this.userRepository.findById(adminId)

    if (!user) return left(new ResourceNotFoundError('User'))

    if (!user.isAdmin()) return left(new UnauthorizedError())

    const character = await this.characterRepository.findById(characterId)

    if (!character) return left(new ResourceNotFoundError('Character'))

    if (name) {
      const newName = await this.characterRepository.findByName(name)

      if (newName) return left(new ResourceAlreadyExistError('Name'))

      character.name = name
    }

    character.description = description ?? character.description
    character.ranking = ranking ?? character.ranking

    await this.characterRepository.save(character)

    return right(null)
  }
}
