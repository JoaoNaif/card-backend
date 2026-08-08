import { PrismaBattleFieldRepository } from "../../../repositories/prisma/prisma-battle-field-repository"
import { CachedBattleFieldRepository } from "../../../repositories/redis/cached-battle-field-repository"
import { PrismaPowerRepository } from "../../../repositories/prisma/prisma-power-repository"
import { CachedPowerRepository } from "../../../repositories/redis/cached-power-repository"
import { PrismaSkillRepository } from "../../../repositories/prisma/prisma-skill-repository"
import { CachedSkillRepository } from "../../../repositories/redis/cached-skill-repository"
import { FetchSkillUseCase } from "../../../use-cases/Skill/fetch-skill"
import { FetchSkillController } from "../fetch-skill.controller"

export function makeFetchSkillController(): FetchSkillController {
    const skillRepository = new CachedSkillRepository(new PrismaSkillRepository())
    const powerRepository = new CachedPowerRepository(new PrismaPowerRepository())
    const battleFieldRepository = new CachedBattleFieldRepository(new PrismaBattleFieldRepository())
    const fetchSkillUseCase = new FetchSkillUseCase(skillRepository, powerRepository, battleFieldRepository)
    const fetchSkillController = new FetchSkillController(fetchSkillUseCase)

    return fetchSkillController
}