import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import * as schema from './schema'

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null

export function useDb() {
  if (_db) return _db

  const config = useRuntimeConfig()

  const client = createClient({
    url: config.tursoUrl as string,
    authToken: config.tursoAuthToken as string,
  })

  _db = drizzle(client, { schema })
  return _db
}
