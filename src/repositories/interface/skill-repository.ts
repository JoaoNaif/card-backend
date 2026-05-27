import type { Prisma, Skill } from "../../generated/prisma"

export interface ISkillRepository {
    findByName(name: string): Promise<Skill | null>
    findById(id: string): Promise<Skill | null>
    findAll(search?: string, page?: number, limit?: number): Promise<Skill[]>
    create(data: Prisma.SkillUncheckedCreateInput): Promise<Skill>
    save(data: Prisma.SkillUpdateInput): Promise<Skill>
    delete(data: Prisma.SkillUpdateInput): Promise<void>
}