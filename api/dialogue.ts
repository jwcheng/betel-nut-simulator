import { Redis } from '@upstash/redis'

// Defined here, not imported: Vercel functions can't resolve modules outside
// api/ at runtime (ERR_MODULE_NOT_FOUND). Keep DEFAULT_MODEL in sync with the
// display copy in src/config.ts.
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'
const DEFAULT_MODEL = 'deepseek/deepseek-v4-flash'
const MAX_TOKENS = 200
const TEMPERATURE = 0.8

const API_KEY = process.env.OPENROUTER_API_KEY

const redis = new Redis({
  url: (process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL) as string,
  token: (process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN) as string,
})

// Generous for a turn-based conversation (a player sends a handful of lines a
// minute), tight for a script hammering the endpoint.
const RATE_LIMIT_PER_MIN = 15
// system + HISTORY_WINDOW + player line + retry reminder, with headroom
const MAX_MESSAGES = 16
const MAX_CONTENT_CHARS = 8000
const MAX_TOTAL_CHARS = 16000
const ROLES = new Set(['system', 'user', 'assistant'])

async function rateLimited(req: any): Promise<boolean> {
  const ip = String(req.headers['x-forwarded-for'] ?? 'unknown')
    .split(',')[0]
    .trim()
  try {
    const key = `rl:dlg:${ip}`
    const count = await redis.incr(key)
    if (count === 1) await redis.expire(key, 60)
    return count > RATE_LIMIT_PER_MIN
  } catch {
    return false // Redis outage degrades to no rate limit, not dead dialogue
  }
}

export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store')

  // health check: lets the client show offline mode without burning a completion
  if (req.method === 'GET') {
    return res.status(200).json({ live: Boolean(API_KEY) })
  }
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST')
    return res.status(405).json({ error: 'method not allowed' })
  }
  if (!API_KEY) return res.status(503).json({ error: 'AI dialogue not configured' })
  if (await rateLimited(req)) return res.status(429).json({ error: 'slow down' })

  let messages: { role: string; content: string }[]
  try {
    const b = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) ?? {}
    const raw = b.messages
    if (!Array.isArray(raw) || raw.length === 0 || raw.length > MAX_MESSAGES) throw new Error()
    let total = 0
    messages = raw.map((m: unknown, i: number) => {
      const { role, content } = (m ?? {}) as { role?: unknown; content?: unknown }
      // at most one system prompt, always first — the rest is conversation
      if (typeof role !== 'string' || !ROLES.has(role) || (role === 'system' && i !== 0))
        throw new Error()
      if (typeof content !== 'string' || content.length === 0 || content.length > MAX_CONTENT_CHARS)
        throw new Error()
      total += content.length
      return { role, content }
    })
    if (total > MAX_TOTAL_CHARS) throw new Error()
  } catch {
    return res.status(400).json({ error: 'bad request' })
  }

  try {
    const upstream = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // model and cost bounds are pinned here; the client only sends conversation
        model: DEFAULT_MODEL,
        messages,
        max_tokens: MAX_TOKENS,
        temperature: TEMPERATURE,
      }),
    })
    if (!upstream.ok) return res.status(502).json({ error: `upstream ${upstream.status}` })
    const data = (await upstream.json()) as {
      choices?: { message?: { content?: string } }[]
    }
    const content = data.choices?.[0]?.message?.content
    if (!content) return res.status(502).json({ error: 'empty completion' })
    return res.status(200).json({ content })
  } catch {
    return res.status(502).json({ error: 'upstream unreachable' })
  }
}