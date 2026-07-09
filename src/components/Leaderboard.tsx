import { useEffect, useState } from 'react'
import { useGame } from '../game/gameState'

export interface LbEntry {
  n: string
  c: number
  r: number
  ch: number
  h: number
  e: string
  t: number
}

/**
 * Leaderboard panel. Read-only by default; `allowSubmit` adds the
 * carve-your-name form (used on the ending screen, where the run's
 * stats are final).
 */
export function LeaderboardPanel({
  allowSubmit = false,
  className = '',
}: {
  allowSubmit?: boolean
  className?: string
}) {
  const { state } = useGame()
  const [entries, setEntries] = useState<LbEntry[] | null>(null)
  const [failed, setFailed] = useState(false)
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submittedAs, setSubmittedAs] = useState<string | null>(null)

  async function load() {
    try {
      const r = await fetch('/api/leaderboard')
      if (!r.ok) throw new Error()
      const d = (await r.json()) as { entries: LbEntry[] }
      setEntries(d.entries)
    } catch {
      setFailed(true)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function submit() {
    const trimmed = name.trim()
    if (!trimmed || submitting) return
    setSubmitting(true)
    try {
      const r = await fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: trimmed,
          cash: state.stats.cash,
          reputation: state.stats.reputation,
          charm: state.stats.charm,
          heat: state.stats.heat,
          ending: state.ending?.id ?? '',
        }),
      })
      if (!r.ok) throw new Error()
      setSubmittedAs(trimmed)
      await load()
    } catch {
      setFailed(true)
    }
    setSubmitting(false)
  }

  if (failed) {
    return (
      <p className={`text-[11px] text-white/35 ${className}`}>
        The leaderboard is unreachable right now.
      </p>
    )
  }

  return (
    <div
      className={`w-full rounded-xl border border-white/10 bg-black/40 p-4 text-left backdrop-blur-sm ${className}`}
    >
      <h3 className="font-display text-sm font-bold tracking-widest text-white/70">
        排行榜 · Leaderboard
      </h3>

      {allowSubmit &&
        (submittedAs === null ? (
          <div className="mt-3 flex gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submit()
              }}
              maxLength={20}
              placeholder="Carve your name into the empire…"
              className="min-w-0 flex-1 rounded-lg border border-white/15 bg-noir-950/80 px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-gold-throne/70"
            />
            <button
              type="button"
              onClick={submit}
              disabled={submitting || !name.trim()}
              className="rounded-lg border border-gold-throne/60 bg-black/40 px-4 py-2 text-xs font-bold tracking-widest text-white transition-all hover:bg-gold-throne/20 disabled:opacity-30"
            >
              {submitting ? '…' : 'RECORD'}
            </button>
          </div>
        ) : (
          <p className="mt-2 text-xs text-gold-throne">
            Recorded. The street remembers, {submittedAs}.
          </p>
        ))}

      {entries === null ? (
        <p className="mt-3 text-[11px] text-white/35">Loading…</p>
      ) : entries.length === 0 ? (
        <p className="mt-3 text-[11px] text-white/35">No names carved yet. Be the first.</p>
      ) : (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-[11px] leading-relaxed">
            <thead>
              <tr className="text-left text-white/40">
                <th className="pr-2 font-normal">#</th>
                <th className="pr-2 font-normal">Name</th>
                <th className="pr-2 text-right font-normal">Cash</th>
                <th className="pr-2 text-right font-normal">Rep</th>
                <th className="pr-2 text-right font-normal">Charm</th>
                <th className="text-right font-normal">Heat</th>
              </tr>
            </thead>
            <tbody className="tabular-nums">
              {entries.slice(0, 10).map((e, i) => {
                const mine = submittedAs !== null && e.n === submittedAs
                return (
                  <tr key={`${e.n}_${e.t}`} className={mine ? 'text-gold-throne' : 'text-white/75'}>
                    <td className="pr-2">{i + 1}</td>
                    <td className="max-w-[10rem] truncate pr-2">{e.n}</td>
                    <td className="pr-2 text-right">NT${e.c.toLocaleString()}</td>
                    <td className="pr-2 text-right">{e.r}</td>
                    <td className="pr-2 text-right">{e.ch}</td>
                    <td className="text-right">{e.h}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
