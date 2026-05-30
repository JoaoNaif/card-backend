import type { Character, Ranking } from "../../generated/prisma"
import type { ICharacterRepository } from "../../repositories/interface/character-repository"
import type { IUserRepository } from "../../repositories/interface/user-repository"

interface CreateCharacterUseCaseRequest {
    userId: string
    name: string
    description: string
    powerId: string
    ranking: Ranking
}

interface CreateCharacterUseCaseResponse {
    character: Character
}

export class CreateCharacterUseCase {
    constructor(private characterRepository: ICharacterRepository, private userRepository: IUserRepository) { }

    async execute({
        userId,
        name,
        description,
        powerId,
        ranking
    }: CreateCharacterUseCaseRequest): Promise<CreateCharacterUseCaseResponse> {
        const characterAlreadyExists = await this.characterRepository.findByName(name)

        if (characterAlreadyExists) {
            throw new Error('Character already exists')
        }

        const user = await this.userRepository.findById(userId)

        if (!user) {
            throw new Error('User not found')
        }

        const character = await this.characterRepository.create({
            userId,
            name,
            description,
            powerId,
            ranking
        })

        return {
            character
        }
    }
}