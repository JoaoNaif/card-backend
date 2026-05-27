import type { Prisma, Skill } from "../../generated/prisma";
import type { ISkillRepository } from "../interface/skill-repository";
import { prisma } from "../../config/prisma";

export class PrismaSkillRepository implements ISkillRepository {
    async findByName(name: string): Promise<Skill | null> {
        return await prisma.skill.findFirst({
            where: { name },
        });
    }

    async findById(id: string): Promise<Skill | null> {
        return await prisma.skill.findUnique({
            where: { id },
        });
    }

    async findAll(search: string = '', page: number = 1, limit: number = 10): Promise<Skill[]> {
        return await prisma.skill.findMany({
            where: { name: { contains: search } },
            take: limit,
            skip: (page - 1) * limit,
        });
    }

    async create(data: Prisma.SkillUncheckedCreateInput): Promise<Skill> {
        return await prisma.skill.create({
            data,
        });
    }

    async save(data: Prisma.SkillUpdateInput): Promise<Skill> {
        const id = data.id as string;
        return await prisma.skill.update({
            where: { id },
            data,
        });
    }

    async delete(data: Prisma.SkillUpdateInput): Promise<void> {
        const id = data.id as string;
        await prisma.skill.delete({
            where: { id },
        });
    }
}