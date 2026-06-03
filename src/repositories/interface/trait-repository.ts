import type { Trait } from '../../entities/trait'

export interface ITraitRepository {
  create(trait: Trait): Promise<void>
  save(trait: Trait): Promise<void>
  delete(trait: Trait): Promise<void>
  findById(id: string): Promise<Trait | null>
  findByName(name: string): Promise<Trait | null>
}
