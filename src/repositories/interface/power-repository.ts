import type { Power, Prisma } from "../../generated/prisma"

export interface IPowerRepository {
    findByName(name: string): Promise<Power | null>
    findById(id: string): Promise<Power | null>
    findAll(search?: string, page?: number, limit?: number): Promise<Power[]>
    create(data: Prisma.PowerCreateInput): Promise<Power>
    save(data: Prisma.PowerUpdateInput): Promise<Power>
    delete(data: Prisma.PowerUpdateInput): Promise<void>
}