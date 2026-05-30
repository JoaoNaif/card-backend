import type { Character, Prisma } from "../../generated/prisma"

export interface ICharacterRepository {
    findByName(name: string): Promise<Character | null>
    findById(id: string): Promise<Character | null>
    findAll(search?: string, page?: number, limit?: number): Promise<Character[]>
    create(data: Prisma.CharacterUncheckedCreateInput): Promise<Character>
    save(data: Prisma.CharacterUpdateInput): Promise<Character>
    delete(data: Prisma.CharacterUpdateInput): Promise<void>
}