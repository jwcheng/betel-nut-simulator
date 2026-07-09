import { useGame } from '../game/gameState'

const ENDING_GRADIENTS: Record<string, string> = {
  coup: 'linear-gradient(160deg, #0d0304 0%, #3a0a10 55%, #6e1016 100%)',
  succession: 'linear-gradient(160deg, #080704 0%, #2a2006 55%, #57430c 100%)',
  betrayed: 'linear-gradient(160deg, #05060a 0%, #101322 55%, #1c2338 100%)',
}

const ENDING_GLYPHS: Record<string, string> = {
  coup: '血',
  succession: '禪',
  betrayed: '逐',
}

export function EndingCard() {
  const { state, dispatch } = useGame()
  const ending = state.ending
  if (!ending) return null

  const allies = [
    state.flags.ally_long && 'Brother Long',
    state.flags.ally_ahmei && 'Ah-Mei’s street network',
    state.flags.allied_hsu && 'Snake Hsu (for now)',
    state.flags.exposed_hsu && 'Big Brother Kuo’s gratitude',
  ].filter(Boolean) as string[]

  return (
    <div
      className="absolute inset-0 z-30 overflow-y-auto"
      style={{ background: ENDING_GRADIENTS[ending.id] }}
    >
      <span
        className="pointer-events-none fixed inset-0 flex items-center justify-center font-display text-[min(80vw,480px)] leading-none text-white/5 select-none"
        aria-hidden
      >
        {ENDING_GLYPHS[ending.id]}
      </span>

      <div className="animate-rise relative mx-auto flex max-w-xl flex-col items-center px-6 py-14 text-center">
        <span className="text-xs uppercase tracking-[0.4em] text-white/50">終幕 · Ending</span>
        <h1 className="mt-3 font-display text-4xl font-black text-gold-throne gold-text">
          {ending.titleZh}
        </h1>
        <h2 className="mt-2 font-display text-lg font-bold tracking-widest text-white/90">
          {ending.title}
        </h2>
        <p className="mt-6 text-sm leading-relaxed text-white/80">{ending.text}</p>

        <div className="mt-8 w-full rounded-xl border border-white/10 bg-black/40 p-4 text-left backdrop-blur-sm">
          <h3 className="font-display text-sm font-bold tracking-widest text-white/70">
            你的道路 · Your Path
          </h3>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-white/70 sm:grid-cols-4">
            <div>💵 NT${state.stats.cash.toLocaleString()}</div>
            <div>⭐ Rep {state.stats.reputation}</div>
            <div>💋 Charm {state.stats.charm}</div>
            <div>🔥 Heat {state.stats.heat}</div>
          </div>
          {allies.length > 0 && (
            <p className="mt-3 text-xs text-white/70">
              <span className="text-white/40">Stood with you:</span> {allies.join(' · ')}
            </p>
          )}
          <ul className="mt-3 space-y-1 border-t border-white/10 pt-3">
            {state.log.map((line, i) => (
              <li key={i} className="text-[11px] leading-relaxed text-white/50">
                {line}
              </li>
            ))}
          </ul>
        </div>

        <button
          type="button"
          onClick={() => dispatch({ type: 'RESET' })}
          className="mt-10 rounded-lg border border-gold-throne/60 bg-black/40 px-8 py-3 font-display text-sm font-bold tracking-widest text-white transition-all hover:bg-gold-throne/20 hover:shadow-[0_0_24px_rgba(212,175,55,0.4)]"
        >
          再來一次 · PLAY AGAIN
        </button>
      </div>
    </div>
  )
}
