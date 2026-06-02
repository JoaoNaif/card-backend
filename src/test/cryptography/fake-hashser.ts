import type { HashCompare } from '../../repositories/cryptography/core/hash-compare'
import type { HashGenerator } from '../../repositories/cryptography/core/hash-generator'

export class FakeHasher implements HashGenerator, HashCompare {
  async hash(plain: string): Promise<string> {
    return plain.concat('-hashed')
  }

  async compare(plain: string, hash: string): Promise<boolean> {
    return plain.concat('-hashed') === hash
  }
}
