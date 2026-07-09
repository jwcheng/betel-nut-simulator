import { CHARACTERS } from '../game/characters'
import { useGame } from '../game/gameState'
import type { ChoiceOption } from '../types/game'

const FLAG_LABELS: Record<string, string> = {
  ally_long: 'Brother Long’s backing',
  ally_ahmei: 'Ah-Mei’s backing',
}

const STAT_LABELS: Record<string, string> = {
  cash: 'Cash',
  reputation: 'Reputation',
  charm: 'Charm',
  heat: 'Heat',
}

export function ChoiceList({
  options,
  onChoose,
}: {
  options: ChoiceOption[]
  onChoose: (opt: ChoiceOption) => void
}) {
  const { state } = useGame()

  return (
    <div className="mt-2 flex flex-col gap-2">
      {options.map((opt, i) => {
        const locks: string[] = []
        if (opt.requiresStat && state.stats[opt.requiresStat.stat] < opt.requiresStat.min) {
          locks.push(`${STAT_LABELS[opt.requiresStat.stat]} ${opt.requiresStat.min}+`)
        }
        if (
          opt.requiresTrust &&
          state.npcs[opt.requiresTrust.character].trust < opt.requiresTrust.min
        ) {
          locks.push(
            `${CHARACTERS[opt.requiresTrust.character].name}’s trust ${opt.requiresTrust.min}+`,
          )
        }
        if (opt.requiresFlag) {
          const flags = Array.isArray(opt.requiresFlag) ? opt.requiresFlag : [opt.requiresFlag]
          if (!flags.some((f) => state.flags[f])) {
            locks.push(flags.map((f) => FLAG_LABELS[f] ?? f).join(' or '))
          }
        }
        const locked = locks.length > 0

        return (
          <button
            key={i}
            type="button"
            disabled={locked}
            onClick={() => onChoose(opt)}
            className={`animate-rise rounded-lg border px-4 py-2.5 text-left text-sm transition-all ${
              locked
                ? 'cursor-not-allowed border-white/5 bg-noir-900/60 text-white/30'
                : 'border-neon-pink/40 bg-noir-900/85 text-white/90 backdrop-blur-md hover:border-neon-pink hover:bg-noir-800 hover:shadow-[0_0_16px_rgba(255,45,120,0.35)] active:scale-[0.99]'
            }`}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            {opt.label}
            {locked && (
              <span className="mt-0.5 block text-[11px] text-neon-red/70">
                🔒 Requires {locks.join(' · ')}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
