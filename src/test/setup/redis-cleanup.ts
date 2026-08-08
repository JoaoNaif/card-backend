import { afterEach } from 'vitest'
import { redis } from '../../config/redis'

afterEach(async () => {
  await redis.flushdb()
})
