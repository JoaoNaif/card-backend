import type { Power } from '../../entities/power'

export interface IPowerRepository {
  findByName(name: string): Promise<Power | null>
  findById(id: string): Promise<Power | null>
  findAll(search: string, page: number, limit: number): Promise<Power[]>
  create(power: Power): Promise<void>
  save(power: Power): Promise<void>
  delete(power: Power): Promise<void>
}
