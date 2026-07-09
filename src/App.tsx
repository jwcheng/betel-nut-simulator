import { useEffect, useReducer } from 'react'
import { hasApiKey } from './api/openrouter'
import { ActTransition } from './components/ActTransition'
import { AIConversation } from './components/AIConversation'
import { ChoiceList } from './components/ChoiceList'
import { DialogueBox } from './components/DialogueBox'
import { EndingCard } from './components/EndingCard'
import { SceneBackground } from './components/SceneBackground'
import { StatBar } from './components/StatBar'
import { DEFAULT_MODEL } from './config'
import { currentAct, GameContext, initialState, reducer, useGame } from './game/gameState'
import type { EffectsNode, PlayerStats, SceneNode } from './types/game'

function StartScreen({ onStart }: { onStart: () => void }) {
  return (
    <div
      className="absolute inset-0 z-30 flex flex-col items-center justify-center overflow-hidden px-6 text-center"
      style={{ background: 'linear-gradient(160deg, #07070f 0%, #170b22 55%, #52103a 100%)' }}
    >
      <span
        className="pointer-events-none absolute font-display text-[min(85vw,500px)] leading-none text-white/5 select-none animate-flicker"
        aria-hidden
      >
        檳
      </span>
      <div className="animate-rise relative flex flex-col items-center">
        <h1 className="font-display text-6xl font-black text-neon-pink neon-text sm:text-7xl">
          檳榔王國
        </h1>
        <h2 className="mt-3 font-display text-lg font-bold tracking-[0.35em] text-white/90">
          BETEL NUT EMPIRE
        </h2>
        <p className="mt-6 max-w-sm text-sm italic leading-relaxed text-white/60">
          A truck. A neon-lit stand. A road that only goes up — if you survive the climb.
        </p>
        <button
          type="button"
          onClick={onStart}
          className="mt-10 rounded-lg border border-neon-pink/60 bg-black/40 px-10 py-3 font-display text-base font-bold tracking-widest text-white transition-all hover:bg-neon-pink/20 hover:shadow-[0_0_28px_rgba(255,45,120,0.5)]"
        >
          開始 · START
        </button>
        <p className="mt-8 text-[10px] text-white/35">
          {hasApiKey ? (
            <>AI dialogue live via OpenRouter · {DEFAULT_MODEL}</>
          ) : (
            <>Offline mode — set VITE_OPENROUTER_API_KEY for live AI dialogue</>
          )}
        </p>
        <p className="mt-2 max-w-sm text-[10px] leading-relaxed text-white/25">
          A work of fiction. All characters, gangs, and places are invented; any resemblance to
          real persons or organizations is coincidental.
        </p>
      </div>
    </div>
  )
}

function fxChips(effects: Partial<PlayerStats>): string[] {
  const chips: string[] = []
  if (effects.cash) chips.push(`${effects.cash > 0 ? '+' : '−'}NT$${Math.abs(effects.cash).toLocaleString()}`)
  if (effects.reputation) chips.push(`${effects.reputation > 0 ? '+' : ''}${effects.reputation} Rep`)
  if (effects.charm) chips.push(`${effects.charm > 0 ? '+' : ''}${effects.charm} Charm`)
  if (effects.heat) chips.push(`${effects.heat > 0 ? '+' : ''}${effects.heat} Heat`)
  return chips
}

function EffectsBeat({ node }: { node: EffectsNode }) {
  const { dispatch } = useGame()
  const apply = () =>
    dispatch({
      type: 'APPLY_EFFECTS',
      nodeId: node.id,
      effects: node.effects,
      logLine: node.logLine,
      next: node.next,
    })

  // silent effects nodes apply and advance immediately
  useEffect(() => {
    if (!node.note) apply()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [node.id])

  if (!node.note) return null
  return (
    <DialogueBox speaker="narrator" text={node.note} onNext={apply}>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {fxChips(node.effects).map((c) => (
          <span
            key={c}
            className="rounded-full border border-gold-throne/50 px-2 py-0.5 text-[11px] font-bold text-gold-throne"
          >
            {c}
          </span>
        ))}
      </div>
    </DialogueBox>
  )
}

function NodeRenderer({ node }: { node: SceneNode }) {
  const { state, dispatch } = useGame()

  // auto-advancing node kinds
  useEffect(() => {
    if (node.kind === 'gate') {
      dispatch({ type: 'GOTO', node: node.check(state) ? node.passNext : node.failNext })
    } else if (node.kind === 'allyCheck') {
      dispatch({ type: 'ALLY_CHECK', node })
    } else if (node.kind === 'endAct') {
      dispatch({ type: 'END_ACT' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [node.id])

  switch (node.kind) {
    case 'narration':
      return (
        <DialogueBox
          speaker="narrator"
          text={node.text}
          onNext={() => dispatch({ type: 'GOTO', node: node.next })}
        />
      )
    case 'line': {
      const mood =
        node.speaker !== 'narrator' && node.speaker !== 'player'
          ? state.npcs[node.speaker].mood
          : undefined
      return (
        <DialogueBox
          speaker={node.speaker}
          text={node.text}
          mood={mood}
          onNext={() => dispatch({ type: 'GOTO', node: node.next })}
        />
      )
    }
    case 'choice':
      return (
        <div className="w-full">
          {node.prompt && <DialogueBox speaker="narrator" text={node.prompt} />}
          <ChoiceList options={node.options} onChoose={(opt) => dispatch({ type: 'CHOOSE', option: opt })} />
        </div>
      )
    case 'ai':
      return <AIConversation key={`${state.act}_${node.id}`} node={node} />
    case 'effects':
      return <EffectsBeat key={node.id} node={node} />
    default:
      return null
  }
}

function Stage() {
  const { state } = useGame()
  const act = currentAct(state)
  const node = act.nodes[state.nodeId]
  const bgSpec = act.backgrounds[state.bg] ?? act.backgrounds[act.defaultBg]

  return (
    <>
      <SceneBackground spec={bgSpec} />
      <StatBar />
      <div className="absolute inset-x-0 bottom-0 z-10 mx-auto w-full max-w-2xl px-3 pb-4 pt-8">
        {node ? (
          <NodeRenderer key={`${state.act}_${node.id}`} node={node} />
        ) : (
          <DialogueBox
            speaker="narrator"
            text={`Missing scene node: "${state.nodeId}" in act ${state.act}. This is a bug in the act script.`}
          />
        )}
      </div>
    </>
  )
}

function Game() {
  const { state, dispatch } = useGame()

  switch (state.phase) {
    case 'start':
      return <StartScreen onStart={() => dispatch({ type: 'START_GAME' })} />
    case 'transition':
      return <ActTransition act={currentAct(state)} onContinue={() => dispatch({ type: 'BEGIN_ACT' })} />
    case 'ending':
      return <EndingCard />
    case 'playing':
      return <Stage />
  }
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, undefined, initialState)
  return (
    <GameContext.Provider value={{ state, dispatch }}>
      <div className="relative h-full w-full overflow-hidden bg-noir-950">
        <Game />
      </div>
    </GameContext.Provider>
  )
}
