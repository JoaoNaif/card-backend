import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import pg from 'pg'

function parseEnvFile(path: string): Record<string, string> {
  try {
    const content = readFileSync(path, 'utf-8')
    const env: Record<string, string> = {}
    for (const line of content.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const idx = trimmed.indexOf('=')
      if (idx === -1) continue
      const key = trimmed.slice(0, idx).trim()
      let value = trimmed.slice(idx + 1).trim()
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1)
      }
      env[key] = value
    }
    return env
  } catch {
    return {}
  }
}

export async function setup() {
  const testEnv = parseEnvFile('.env.test')
  const testDatabaseUrl = testEnv['DATABASE_URL']

  if (!testDatabaseUrl) {
    throw new Error('DATABASE_URL not found in .env.test')
  }

  // Create test database if it doesn't exist
  const url = new URL(testDatabaseUrl)
  const dbName = url.pathname.slice(1)
  const adminUrl = `${url.protocol}//${url.username}:${url.password}@${url.host}/postgres`

  const client = new pg.Client({ connectionString: adminUrl })
  await client.connect()

  const result = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName])
  if (result.rows.length === 0) {
    await client.query(`CREATE DATABASE "${dbName}"`)
  }

  await client.end()

  // Run migrations on test database
  execSync('npx prisma migrate deploy', {
    env: { ...process.env, ...testEnv },
    stdio: 'inherit',
  })
}
