import { PrismaBattleFieldRepository } from "../../../repositories/prisma/prisma-battle-field-repository"
import { PrismaPowerRepository } from "../../../repositories/prisma/prisma-power-repository"
import { PrismaSkillRepository } from "../../../repositories/prisma/prisma-skill-repository"
import { FetchSkillUseCase } from "../../../use-cases/Skill/fetch-skill"
import { FetchSkillController } from "../fetch-skill.controller"

export function makeFetchSkillController(): FetchSkillController {
    const skillRepository = new PrismaSkillRepository()
    const powerRepository = new PrismaPowerRepository()
    const battleFieldRepository = new PrismaBattleFieldRepository()
    const fetchSkillUseCase = new FetchSkillUseCase(skillRepository, powerRepository, battleFieldRepository)
    const fetchSkillController = new FetchSkillController(fetchSkillUseCase)

    return fetchSkillController
}