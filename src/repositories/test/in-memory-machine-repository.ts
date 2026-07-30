import type { Machine } from '../../entities/machine'
import type { IMachineRepository } from '../interface/machine-repository'

export class InMemoryMachineRepository implements IMachineRepository {
  public items: Machine[] = []

  async create(machine: Machine): Promise<void> {
    this.items.push(machine)
  }

  async findByLabel(label: string): Promise<Machine | null> {
    return this.items.find((m) => m.label === label) ?? null
  }

  async findById(id: string): Promise<Machine | null> {
    return this.items.find((m) => m.id.toString() === id) ?? null
  }

  async findAll(): Promise<Machine[]> {
    return this.items
  }
}
