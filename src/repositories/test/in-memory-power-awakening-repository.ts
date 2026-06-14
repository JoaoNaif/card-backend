import type { PowerAwakening } from '../../entities/power-awakening'
import type { IPowerAwakeningRepository } from '../interface/power-awakening-repository'

export class InMemoryPowerAwakeningRepository implements IPowerAwakeningRepository {
  public items: PowerAwakening[] = []

  async create(awakening: PowerAwakening): Promise<void> {
    this.items.push(awakening)
  }

  async findByBaseAndAwakened(
    basePowerId: string,
    awakenedPowerId: string
  ): Promise<PowerAwakening | null> {
    return (
      this.items.find(
        (i) =>
          i.awakenedPowerId === awakenedPowerId && i.basePowerId === basePowerId
      ) ?? null
    )
  }

  async findByBasePowerId(basePowerId: string): Promise<PowerAwakening[]> {
    return this.items.filter((i) => i.basePowerId === basePowerId)
  }
}
