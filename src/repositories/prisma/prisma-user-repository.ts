import type { IUserRepository } from '../interface/user-repository'
import { prisma } from '../../config/prisma'
import type { User } from '../../entities/user'
import { PrismaUserMapper } from './mappers/prisma-user-mapper'

export class PrismaUserRepository implements IUserRepository {
  async create(user: User): Promise<void> {
    const data = PrismaUserMapper.toPrisma(user)

    await prisma.user.create({
      data,
    })
  }

  async save(user: User): Promise<void> {
    const id = user.id.toString()
    await prisma.user.update({
      where: { id },
      data: PrismaUserMapper.toPrismaUpdate(user),
    })
  }

  async delete(user: User): Promise<void> {
    const id = user.id.toString()
    await prisma.user.delete({ where: { id } })
  }

  async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { id } })
    return user ? PrismaUserMapper.toDomain(user) : null
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { email } })
    return user ? PrismaUserMapper.toDomain(user) : null
  }
}
