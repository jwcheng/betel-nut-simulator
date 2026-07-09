import { useGame } from '../game/gameState'

function Stat({
  label,
  zh,
  value,
  accent,
  pulse,
}: {
  label: string
  zh: string
  value: string
  accent: string
  pulse?: boolean
}) {
  return (
    <div className="flex min-w-0 flex-col items-center px-1">
      <span className="text-[9px] uppercase tracking-widest text-white/40">
        {zh} {label}
      </span>
      <span
        className={`font-display text-sm font-bold tabular-nums ${pulse ? 'animate-heat-pulse' : ''}`}
        style={pulse ? undefined : { color: accent }}
      >
        {value}
      </span>
    </div>
  )
}

export function StatBar() {
  const { state } = useGame()
  const { cash, reputation, charm, heat } = state.stats
  const act = state.act

  return (
    <div className="absolute inset-x-0 top-0 z-20 border-b border-white/10 bg-noir-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-3 py-1.5">
        <div className="font-display text-xs text-neon-pink neon-text">
          第{['一', '二', '三', '四', '五'][act - 1]}幕
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <Stat label="Cash" zh="現金" value={`NT$${cash.toLocaleString()}`} accent="#7ddf9a" />
          <Stat label="Rep" zh="聲望" value={String(reputation)} accent="#d4af37" />
          <Stat label="Charm" zh="魅力" value={String(charm)} accent="#ff6fa5" />
          <Stat label="Heat" zh="風聲" value={String(heat)} accent="#ff3b3b" pulse={heat >= 60} />
        </div>
      </div>
    </div>
  )
}
