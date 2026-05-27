import type { Skill } from "../../generated/prisma"
import type { ISkillRepository } from "../../repositories/interface/skill-repository"

interface FetchSkillRequest {
    search: string
    page: number
    limit: number
}

interface FetchSkillResponse {
    skill: Skill[]
}

export class FetchSkillUseCase {
    constructor(private skillRepository: ISkillRepository) { }

    async execute(request: FetchSkillRequest): Promise<FetchSkillResponse> {
        const { search, page, limit } = request

        const skills = await this.skillRepository.findAll(
            search,
            page,
            limit
        )

        return { skill: skills }
    }
}