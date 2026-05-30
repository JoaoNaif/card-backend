import type { Character, Prisma } from "../../generated/prisma";
import type { ICharacterRepository } from "../interface/character-repository";
import { prisma } from "../../config/prisma";

export class PrismaCharacterRepository implements ICharacterRepository {
    async findByName(name: string): Promise<Character | null> {
        return await prisma.character.findFirst({
            where: { name }
        })
    }

    async findById(id: string): Promise<Character | null> {
        return await prisma.character.findUnique({
            where: { id }
        })
    }

    async findAll(search: string = '', page: number = 1, limit: number = 10): Promise<Character[]> {
        return await prisma.character.findMany({
            where: { name: { contains: search } },
            take: limit,
            skip: (page - 1) * limit,
        })
    }

    async create(data: Prisma.CharacterUncheckedCreateInput): Promise<Character> {
        return await prisma.character.create({
            data
        })
    }

    async save(data: Prisma.CharacterUpdateInput): Promise<Character> {
        const id = data.id as string;

        return await prisma.character.update({
            where: { id },
            data
        })
    }

    async delete(data: Prisma.CharacterUpdateInput): Promise<void> {
        const id = data.id as string;

        await prisma.character.delete({
            where: { id }
        })
    }
}