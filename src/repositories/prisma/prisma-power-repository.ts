import type { Power, Prisma } from '../../generated/prisma';
import type { IPowerRepository } from '../interface/power-repository';
import { prisma } from '../../config/prisma';

export class PrismaPowerRepository implements IPowerRepository {
    async create(data: Prisma.PowerCreateInput): Promise<Power> {
        return await prisma.power.create({
            data
        });
    }

    async findByName(name: string): Promise<Power | null> {
        return await prisma.power.findFirst({
            where: { name },
        });
    }

    async findById(id: string): Promise<Power | null> {
        return await prisma.power.findUnique({
            where: { id },
        });
    }

    async findAll(search: string = '', page: number = 1, limit: number = 10): Promise<Power[]> {
        return await prisma.power.findMany({
            where: { name: { contains: search } },
            take: limit,
            skip: (page - 1) * limit,
        });
    }

    async save(data: Prisma.PowerUpdateInput): Promise<Power> {
        const id = data.id as string;
        return await prisma.power.update({
            where: { id },
            data,
        });
    }

    async delete(data: Prisma.PowerUpdateInput): Promise<void> {
        const id = data.id as string;
        await prisma.power.delete({
            where: { id },
        });
    }
}