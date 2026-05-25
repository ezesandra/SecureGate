import { Ratelimit, type Duration } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

function createRatelimit(limit: number, window: Duration): Ratelimit {
  try {
    const redis = Redis.fromEnv()
    return new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(limit, window), analytics: false })
  } catch {
    console.warn(`Upstash Redis not available — using in-memory rate limiter (${limit} req / ${window})`)
    return createMemoryRatelimit(limit, window)
  }
}

function createMemoryRatelimit(max: number, windowStr: string): Ratelimit {
  const windowMs = parseWindow(windowStr)
  const hits = new Map<string, number[]>()

  setInterval(() => {
    const cutoff = Date.now() - windowMs
    for (const [key, timestamps] of hits) {
      const valid = timestamps.filter(t => t > cutoff)
      if (valid.length > 0) hits.set(key, valid)
      else hits.delete(key)
    }
  }, 60_000).unref()

  return {
    limit: async (identifier: string) => {
      const now = Date.now()
      const cutoff = now - windowMs
      const timestamps = (hits.get(identifier) || []).filter(t => t > cutoff)
      const current = timestamps.length
      const success = current < max
      if (success) timestamps.push(now)
      hits.set(identifier, timestamps)
      return { success, limit: max, remaining: Math.max(0, max - current - (success ? 1 : 0)), reset: now + windowMs }
    },
  } as Ratelimit
}

function parseWindow(w: string): number {
  const [n, unit] = w.split(' ')
  const ms = unit.startsWith('s') ? 1000 : unit.startsWith('m') ? 60_000 : unit.startsWith('h') ? 3600_000 : 1
  return parseInt(n) * ms
}

export const authRatelimit = createRatelimit(5, '10 m')
export const strictRatelimit = createRatelimit(3, '10 m')
