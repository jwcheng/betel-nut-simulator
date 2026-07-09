import { useEffect, useRef, useState } from 'react'
import { MOOD_TINTS } from '../game/characters'
import type { Mood } from '../types/game'

export function TrustMeter({ trust, mood }: { trust: number; mood: Mood }) {
  const prev = useRef(trust)
  const [delta, setDelta] = useState<number | null>(null)

  useEffect(() => {
    const d = trust - prev.current
    prev.current = trust
    if (d !== 0) {
      setDelta(d)
      const t = setTimeout(() => setDelta(null), 1600)
      return () => clearTimeout(t)
    }
  }, [trust])

  const tint = MOOD_TINTS[mood]

  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] uppercase tracking-widest text-white/40">信任 Trust</span>
      <div className="relative h-1.5 w-24 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${trust}%`, background: tint, boxShadow: `0 0 8px ${tint}` }}
        />
      </div>
      <span className="w-6 text-right text-[11px] font-bold tabular-nums" style={{ color: tint }}>
        {trust}
      </span>
      <span className="w-8 text-[11px] font-bold">
        {delta !== null && (
          <span className={`animate-rise ${delta > 0 ? 'text-emerald-400' : 'text-neon-red'}`}>
            {delta > 0 ? `+${delta}` : delta}
          </span>
        )}
      </span>
      <span
        className="rounded-full border px-1.5 py-px text-[9px] uppercase tracking-wider"
        style={{ color: tint, borderColor: `${tint}88` }}
      >
        {mood}
      </span>
    </div>
  )
}
