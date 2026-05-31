import type { User } from '../../entities/user'

export interface IUserRepository {
  create(user: User): Promise<void>
  save(user: User): Promise<void>
  delete(user: User): Promise<void>
  findById(id: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
}
