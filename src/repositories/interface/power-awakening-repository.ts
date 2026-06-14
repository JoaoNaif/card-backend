import type { PowerAwakening } from '../../entities/power-awakening'

export interface IPowerAwakeningRepository {
  create(awakening: PowerAwakening): Promise<void>
  findByBaseAndAwakened(
    basePowerId: string,
    awakenedPowerId: string
  ): Promise<PowerAwakening | null>
  findByBasePowerId(basePowerId: string): Promise<PowerAwakening[]>
}
