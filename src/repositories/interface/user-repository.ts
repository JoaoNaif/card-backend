import type { Prisma, User } from "../../generated/prisma"

export interface IUserRepository {
    create(user: Prisma.UserCreateInput): Promise<User>
    save(user: Prisma.UserUpdateInput): Promise<void>
    delete(user: Prisma.UserUpdateInput): Promise<void>
    findById(id: string): Promise<User | null>
    findByEmail(email: string): Promise<User | null>
}