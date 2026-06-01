import { UniqueEntityId } from '../../../core/entities/unique-entity-id'
import { User } from '../../../entities/user'
import type { User as UserPrisma } from '../../../generated/prisma'

export class PrismaUserMapper {
  static toDomain(user: UserPrisma): User {
    return User.create(
      {
        name: user.name,
        email: user.email,
        passwordHash: user.passwordHash,
        createdAt: user.createdAt,
      },
      new UniqueEntityId(user.id)
    )
  }

  static toPrisma(user: User) {
    return {
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      passwordHash: user.passwordHash,
      createdAt: user.createdAt,
    }
  }

  static toPrismaUpdate(user: User) {
    return {
      name: user.name,
      email: user.email,
      passwordHash: user.passwordHash,
      createdAt: user.createdAt,
    }
  }
}
