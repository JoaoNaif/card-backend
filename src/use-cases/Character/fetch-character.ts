import type { ICharacterRepository } from "../../repositories/interface/character-repository";
import type { IPowerRepository } from "../../repositories/interface/power-repository";
import type { IUserRepository } from "../../repositories/interface/user-repository";
import type { dtoFetchCharacter } from "./dto/dto-fetch-character";

export interface FetchCharacterUseCaseRequest {
    search?: string
    page?: number
    limit?: number
}

interface FetchCharacterUseCaseResponse {
    characters: {
        characters: dtoFetchCharacter[],
    }
}

export class FetchCharacterUseCase {
    constructor(
        private characterRepository: ICharacterRepository,
        private powerRepository: IPowerRepository,
        private userRepository: IUserRepository
    ) { }

    async execute({
        search,
        page,
        limit
    }: FetchCharacterUseCaseRequest): Promise<FetchCharacterUseCaseResponse> {
        const characters = await this.characterRepository.findAll(search, page, limit)

        const charactersWithRelations = await Promise.all(
            characters.map(async (character) => {
                const power = await this.powerRepository.findById(character.powerId)
                if (!power) {
                    throw new Error(`Power not found for character: ${character.id}`)
                }

                if (!character.userId) {
                    throw new Error(`User not found for character: ${character.id}`)
                }

                const user = await this.userRepository.findById(character.userId)
                if (!user) {
                    throw new Error(`User not found for character: ${character.id}`)
                }

                return {
                    character,
                    power,
                    user
                }
            })
        )

        return {
            characters: {
                characters: charactersWithRelations
            }
        }
    }
}

