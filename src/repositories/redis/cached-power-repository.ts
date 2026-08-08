import { UniqueEntityId } from '../../core/entities/unique-entity-id'
import { Power, type PowerProps } from '../../entities/power'
import type { IPowerRepository } from '../interface/power-repository'
import {
  CATALOG_CACHE_TTL_SECONDS,
  cacheDelete,
  cacheGet,
  cacheSet,
  type SerializedEntity,
} from './cache'

type CachedPower = SerializedEntity<Omit<PowerProps, 'createdAt'> & { createdAt: string }>

function powerKey(id: string): string {
  return `power:${id}`
}

function revive(cached: CachedPower): Power {
  return Power.create(
    { ...cached.props, createdAt: new Date(cached.props.createdAt) },
    new UniqueEntityId(cached.id)
  )
}

export class CachedPowerRepository implements IPowerRepository {
  constructor(private inner: IPowerRepository) {}

  findByName(name: string): Promise<Power | null> {
    return this.inner.findByName(name)
  }

  findAll(search: string, page: number, limit: number): Promise<Power[]> {
    return this.inner.findAll(search, page, limit)
  }

  async findById(id: string): Promise<Power | null> {
    const cached = await cacheGet<CachedPower>(powerKey(id))
    if (cached) return revive(cached)

    const power = await this.inner.findById(id)
    if (power) {
      await cacheSet(powerKey(id), power.toJSON(), CATALOG_CACHE_TTL_SECONDS)
    }
    return power
  }

  async create(power: Power): Promise<void> {
    await this.inner.create(power)
  }

  async save(power: Power): Promise<void> {
    await this.inner.save(power)
    await cacheDelete(powerKey(power.id.toString()))
  }

  async delete(power: Power): Promise<void> {
    await this.inner.delete(power)
    await cacheDelete(powerKey(power.id.toString()))
  }
}
