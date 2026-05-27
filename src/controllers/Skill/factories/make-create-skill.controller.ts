import { PrismaSkillRepository } from "../../../repositories/prisma/prisma-skill-repository";
import { CreateSkillUseCase } from "../../../use-cases/Skill/create-skill";
import { CreateSkillController } from "../create-skill.controller";

export function makeCreateSkillController(): CreateSkillController {
    const skillRepository = new PrismaSkillRepository()
    const createSkillUseCase = new CreateSkillUseCase(skillRepository)
    const createSkillController = new CreateSkillController(createSkillUseCase)

    return createSkillController
}