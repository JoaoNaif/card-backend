import { compare, hash } from 'bcryptjs'
import type { HashGenerator } from './core/hash-generator'
import type { HashCompare } from './core/hash-compare'

export class BcryptHasher implements HashGenerator, HashCompare {
  private HASH_SALT_LENGTH = 8

  async hash(plain: string): Promise<string> {
    return hash(plain, this.HASH_SALT_LENGTH)
  }

  async compare(plain: string, hash: string): Promise<boolean> {
    return compare(plain, hash)
  }
}
