import type { Power, Skill } from "../../generated/prisma"
import type { ISkillRepository } from "../../repositories/interface/skill-repository"

interface CreateSkillUseCaseRequest {
    name: string
    description: string
    limitation: string
    cost: string
    powerId: string
}

interface CreateSkillUseCaseResponse {
    skill: Skill
}

export class CreateSkillUseCase {
    constructor(private skillRepository: ISkillRepository) { }

    async execute({
        name,
        description,
        limitation,
        cost,
        powerId
    }: CreateSkillUseCaseRequest): Promise<CreateSkillUseCaseResponse> {
        const skillAlreadyExists = await this.skillRepository.findByName(name)

        if (skillAlreadyExists) {
            throw new Error('Skill already exists')
        }

        const skill = await this.skillRepository.create({
            name,
            description,
            limitation,
            cost,
            powerId
        })

        return {
            skill
        }
    }
}