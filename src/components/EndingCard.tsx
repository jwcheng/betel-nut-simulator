import { useState } from 'react'
import { useGame } from '../game/gameState'
import { SECRET_DEFS, secretWorth } from '../game/secrets'
import { LeaderboardPanel } from './Leaderboard'

// display copy only — worth (trust bonus + stat effects) comes from the act scripts via SECRET_DEFS
const SECRETS: { flag: string; who: string; where: string; secret: string }[] = [
  { flag: 'sec_a1_ahmei', who: 'Ah-Mei', where: 'Act 1 · the stand', secret: 'A Binnan girl — half her pay goes home to her mother and little brother' },
  { flag: 'sec_a1_long', who: 'Long', where: 'Act 1 · the alley', secret: 'He was a nobody driver once — exactly like you' },
  { flag: 'sec_a2_tsai', who: 'Tsai', where: 'Act 2 · the shed', secret: 'He shorts the shipments to survive Kuo’s rising quotas' },
  { flag: 'sec_a3_route', who: 'Long', where: 'Act 3 · the warehouse', secret: 'The route was open because the last driver talked at a rest stop' },
  { flag: 'sec_a3_throne', who: 'Long', where: 'Act 3 · the noodle stall', secret: 'Kuo offered him the throne once. He refused it' },
  { flag: 'sec_a4_hsu', who: 'Hsu', where: 'Act 4 · the tea house', secret: 'No trucks of his own — you were the leverage all along' },
  { flag: 'sec_a4_ledger', who: 'Ah-Mei', where: 'Act 4 · Twin Star №3', secret: 'Years of plates and faces, written down. Insurance' },
  { flag: 'sec_a4_condition', who: 'Long', where: 'Act 4 · the warehouse', secret: 'Protect the farms and drivers — or he removes you himself' },
  { flag: 'sec_a4_kaoliang', who: 'Long', where: 'Act 4 · drinks', secret: 'The northern kaoliang he poured the night the last succession failed' },
  { flag: 'sec_a4_crates', who: 'Ah-Mei', where: 'Act 4 · her corner', secret: 'Kuo’s own men, moving crates out before dawn' },
  { flag: 'sec_a4_clause', who: 'Hsu', where: 'Act 4 · tea, again', secret: 'The clause: your drivers answer to his cousin the day after' },
  { flag: 'sec_a5_kuo', who: 'Kuo', where: 'Act 5 · the back room', secret: 'The three before you lied. He only ever wanted to be let go' },
]

function SecretsTable() {
  const { state } = useGame()
  const [open, setOpen] = useState(false)
  const found = SECRETS.filter((s) => state.flags[s.flag]).length

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-6 text-[10px] tracking-wide text-white/30 transition-colors hover:text-gold-throne/80"
      >
        🔍 你知道全部了嗎？ · you found {found} of {SECRETS.length} secrets — see them all
      </button>
    )
  }

  return (
    <div className="mt-6 w-full rounded-xl border border-white/10 bg-black/40 p-4 text-left backdrop-blur-sm">
      <h3 className="font-display text-sm font-bold tracking-widest text-white/70">
        秘密 · The Secrets ({found}/{SECRETS.length} uncovered)
      </h3>
      <ul className="mt-3 space-y-2">
        {SECRETS.map((s) => {
          const got = Boolean(state.flags[s.flag])
          const def = SECRET_DEFS[s.flag]
          return (
            <li key={s.flag} className="text-[11px] leading-relaxed">
              <span className={got ? 'text-gold-throne' : 'text-white/35'}>
                {got ? '✓' : '·'} <b>{s.who}</b>{' '}
                <span className="text-white/30">
                  ({s.where}{def ? ` · ${secretWorth(def.bonus, def.effects)}` : ''})
                </span>
              </span>{' '}
              <span className={got ? 'text-white/75' : 'text-white/40'}>{s.secret}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

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

        <LeaderboardPanel allowSubmit className="mt-8" />

        <SecretsTable />

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
