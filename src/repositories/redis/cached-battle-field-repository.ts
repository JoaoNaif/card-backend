import { UniqueEntityId } from '../../core/entities/unique-entity-id'
import { BattleField, type BattleFieldProps } from '../../entities/battle-field'
import type { IBattleFieldRepository } from '../interface/battle-field-repository'
import {
  CATALOG_CACHE_TTL_SECONDS,
  cacheDelete,
  cacheGet,
  cacheSet,
  type SerializedEntity,
} from './cache'

type CachedBattleField = SerializedEntity<
  Omit<BattleFieldProps, 'createdAt'> & { createdAt: string }
>

const ALL_IDS_KEY = 'battle-field:all-ids'

function battleFieldKey(id: string): string {
  return `battle-field:${id}`
}

function revive(cached: CachedBattleField): BattleField {
  return BattleField.create(
    { ...cached.props, createdAt: new Date(cached.props.createdAt) },
    new UniqueEntityId(cached.id)
  )
}

export class CachedBattleFieldRepository implements IBattleFieldRepository {
  constructor(private inner: IBattleFieldRepository) {}

  findByName(name: string): Promise<BattleField | null> {
    return this.inner.findByName(name)
  }

  findAll(search?: string, page?: number, limit?: number): Promise<BattleField[]> {
    return this.inner.findAll(search, page, limit)
  }

  async findById(id: string): Promise<BattleField | null> {
    const cached = await cacheGet<CachedBattleField>(battleFieldKey(id))
    if (cached) return revive(cached)

    const battleField = await this.inner.findById(id)
    if (battleField) {
      await cacheSet(battleFieldKey(id), battleField.toJSON(), CATALOG_CACHE_TTL_SECONDS)
    }
    return battleField
  }

  async findRandom(): Promise<BattleField | null> {
    let ids = await cacheGet<string[]>(ALL_IDS_KEY)

    if (!ids) {
      const all = await this.inner.findAll(undefined, undefined, 1000)
      ids = all.map((battleField) => battleField.id.toString())
      await cacheSet(ALL_IDS_KEY, ids, CATALOG_CACHE_TTL_SECONDS)
      await Promise.all(
        all.map((battleField) =>
          cacheSet(
            battleFieldKey(battleField.id.toString()),
            battleField.toJSON(),
            CATALOG_CACHE_TTL_SECONDS
          )
        )
      )
    }

    if (ids.length === 0) return null
    const randomId = ids[Math.floor(Math.random() * ids.length)]!
    return this.findById(randomId)
  }

  async create(battleField: BattleField): Promise<void> {
    await this.inner.create(battleField)
    await cacheDelete(ALL_IDS_KEY)
  }

  async save(battleField: BattleField): Promise<void> {
    await this.inner.save(battleField)
    await cacheDelete(battleFieldKey(battleField.id.toString()), ALL_IDS_KEY)
  }

  async delete(battleField: BattleField): Promise<void> {
    await this.inner.delete(battleField)
    await cacheDelete(battleFieldKey(battleField.id.toString()), ALL_IDS_KEY)
  }
}
