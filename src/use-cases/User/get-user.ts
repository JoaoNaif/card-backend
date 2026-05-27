import type { User } from "../../generated/prisma"
import type { IUserRepository } from "../../repositories/interface/user-repository"


interface GetUserRequest {
    id: string
}

interface GetUserResponse {
    user: User
}

export class GetUserUseCase {
    constructor(private userRepository: IUserRepository) { }

    async execute({
        id
    }: GetUserRequest): Promise<GetUserResponse> {
        const user = await this.userRepository.findById(id)

        if (!user) {
            throw new Error('User not found')
        }

        return {
            user
        }
    }
}