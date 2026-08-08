import { redis } from '../../config/redis'

export interface SerializedEntity<Props> {
  id: string
  props: Props
}

export const CATALOG_CACHE_TTL_SECONDS = 60 * 60
export const USER_SCOPED_CACHE_TTL_SECONDS = 5 * 60

export async function cacheGet<T>(key: string): Promise<T | null> {
  const raw = await redis.get(key)
  return raw ? (JSON.parse(raw) as T) : null
}

export async function cacheSet(
  key: string,
  value: unknown,
  ttlSeconds: number
): Promise<void> {
  await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds)
}

export async function cacheDelete(...keys: string[]): Promise<void> {
  if (keys.length === 0) return
  await redis.del(...keys)
}
