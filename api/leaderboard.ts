import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: (process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL) as string,
  token: (process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN) as string,
})

const KEY = 'lb'
const MAX_ENTRIES = 500

interface Entry {
  n: string // name
  c: number // cash (rank key)
  r: number // reputation
  ch: number // charm
  h: number // heat
  e: string // ending id
  t: number // timestamp
}

function toEntry(raw: unknown): Entry | null {
  try {
    const o = (typeof raw === 'string' ? JSON.parse(raw) : raw) as Entry
    if (!o || typeof o.n !== 'string') return null
    return o
  } catch {
    return null
  }
}

export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store')
  try {
    if (req.method === 'GET') {
      const raw = await redis.zrange(KEY, 0, 49, { rev: true })
      const entries = (raw as unknown[]).map(toEntry).filter(Boolean)
      return res.status(200).json({ entries })
    }

    if (req.method === 'POST') {
      const b = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) ?? {}
      const name = String(b.name ?? '')
        .trim()
        .replace(/[<>]/g, '')
        .slice(0, 20)
      if (!name) return res.status(400).json({ error: 'name required' })
      const num = (v: unknown) => {
        const n = Number(v)
        return Number.isFinite(n) ? Math.max(0, Math.min(1_000_000_000, Math.round(n))) : 0
      }
      const entry: Entry = {
        n: name,
        c: num(b.cash),
        r: num(b.reputation),
        ch: num(b.charm),
        h: num(b.heat),
        e: String(b.ending ?? '').slice(0, 24),
        t: Date.now(),
      }
      await redis.zadd(KEY, { score: entry.c, member: JSON.stringify(entry) })
      // keep the set bounded: drop everything below the top MAX_ENTRIES
      await redis.zremrangebyrank(KEY, 0, -(MAX_ENTRIES + 1))
      return res.status(200).json({ ok: true })
    }

    res.setHeader('Allow', 'GET, POST')
    return res.status(405).json({ error: 'method not allowed' })
  } catch {
    return res.status(500).json({ error: 'leaderboard unavailable' })
  }
}