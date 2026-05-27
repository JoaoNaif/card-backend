import type { Prisma, User } from '../../generated/prisma';
import type { IUserRepository } from '../interface/user-repository';
import { prisma } from '../../config/prisma';

export class PrismaUserRepository implements IUserRepository {
    async create(data: Prisma.UserCreateInput): Promise<User> {
        return await prisma.user.create({ data });
    }

    async save(user: Prisma.UserUpdateInput): Promise<void> {
        const id = user.id as string;
        await prisma.user.update({
            where: { id },
            data: user,
        });
    }

    async delete(user: Prisma.UserUpdateInput): Promise<void> {
        const id = user.id as string;
        await prisma.user.delete({
            where: { id },
        });
    }

    async findById(id: string): Promise<User | null> {
        return await prisma.user.findUnique({
            where: { id },
        });
    }

    async findByEmail(email: string): Promise<User | null> {
        return await prisma.user.findUnique({
            where: { email },
        });
    }
}
