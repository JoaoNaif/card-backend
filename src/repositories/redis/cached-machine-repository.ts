import { UniqueEntityId } from '../../core/entities/unique-entity-id'
import { Machine, type MachineProps } from '../../entities/machine'
import type { IMachineRepository } from '../interface/machine-repository'
import {
  CATALOG_CACHE_TTL_SECONDS,
  cacheDelete,
  cacheGet,
  cacheSet,
  type SerializedEntity,
} from './cache'

type CachedMachine = SerializedEntity<Omit<MachineProps, 'createdAt'> & { createdAt: string }>

const ALL_KEY = 'machine:all'

function idKey(id: string): string {
  return `machine:id:${id}`
}

function labelKey(label: string): string {
  return `machine:label:${label}`
}

function revive(cached: CachedMachine): Machine {
  return Machine.create(
    { ...cached.props, createdAt: new Date(cached.props.createdAt) },
    new UniqueEntityId(cached.id)
  )
}

export class CachedMachineRepository implements IMachineRepository {
  constructor(private inner: IMachineRepository) {}

  async create(machine: Machine): Promise<void> {
    await this.inner.create(machine)
    await cacheDelete(ALL_KEY)
  }

  async findByLabel(label: string): Promise<Machine | null> {
    const cached = await cacheGet<CachedMachine>(labelKey(label))
    if (cached) return revive(cached)

    const machine = await this.inner.findByLabel(label)
    if (machine) {
      await cacheSet(labelKey(label), machine.toJSON(), CATALOG_CACHE_TTL_SECONDS)
    }
    return machine
  }

  async findById(id: string): Promise<Machine | null> {
    const cached = await cacheGet<CachedMachine>(idKey(id))
    if (cached) return revive(cached)

    const machine = await this.inner.findById(id)
    if (machine) {
      await cacheSet(idKey(id), machine.toJSON(), CATALOG_CACHE_TTL_SECONDS)
    }
    return machine
  }

  async findAll(): Promise<Machine[]> {
    const cached = await cacheGet<CachedMachine[]>(ALL_KEY)
    if (cached) return cached.map(revive)

    const machines = await this.inner.findAll()
    await cacheSet(
      ALL_KEY,
      machines.map((machine) => machine.toJSON()),
      CATALOG_CACHE_TTL_SECONDS
    )
    return machines
  }
}
