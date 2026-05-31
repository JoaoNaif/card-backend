import type { User } from '../../entities/user'
import type { IUserRepository } from '../interface/user-repository'

export class InMemoryUserRepository implements IUserRepository {
  public items: User[] = []

  async create(user: User): Promise<void> {
    this.items.push(user)
  }

  async save(user: User): Promise<void> {
    const index = this.items.findIndex((u) => u.id.equals(user.id))
    if (index >= 0) {
      this.items[index] = user
    }
  }

  async delete(user: User): Promise<void> {
    this.items = this.items.filter((u) => !u.id.equals(user.id))
  }

  async findById(id: string): Promise<User | null> {
    return this.items.find((u) => u.id.toString() === id) ?? null
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.items.find((u) => u.email === email) ?? null
  }
}
