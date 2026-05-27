import { PrismaSkillRepository } from "../../../repositories/prisma/prisma-skill-repository"
import { FetchSkillUseCase } from "../../../use-cases/Skill/fetch-skill"
import { FetchSkillController } from "../fetch-skill.controller"

export function makeFetchSkillController(): FetchSkillController {
    const skillRepository = new PrismaSkillRepository()
    const fetchSkillUseCase = new FetchSkillUseCase(skillRepository)
    const fetchSkillController = new FetchSkillController(fetchSkillUseCase)

    return fetchSkillController
}