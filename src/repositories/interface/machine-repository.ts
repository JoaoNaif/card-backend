import type { Machine } from '../../entities/machine'

export interface IMachineRepository {
  create(machine: Machine): Promise<void>
  findByLabel(label: string): Promise<Machine | null>
  findById(id: string): Promise<Machine | null>
  findAll(): Promise<Machine[]>
}
