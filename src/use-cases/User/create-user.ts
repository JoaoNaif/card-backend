import type { User } from "../../generated/prisma"
import type { IUserRepository } from "../../repositories/interface/user-repository"

interface CreateUserUseCaseRequest {
    name: string
    email: string
}

interface CreateUserUseCaseResponse {
    user: User
}

export class CreateUserUseCase {
    constructor(private userRepository: IUserRepository) { }

    async execute({
        name,
        email
    }: CreateUserUseCaseRequest): Promise<CreateUserUseCaseResponse> {
        const userAlreadyExists = await this.userRepository.findByEmail(email)

        if (userAlreadyExists) {
            throw new Error('User already exists')
        }

        const user = await this.userRepository.create({ name, email });

        return {
            user
        };
    }
}