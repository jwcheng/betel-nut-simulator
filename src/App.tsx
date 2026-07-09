import { useEffect, useReducer, useState } from 'react'
import { hasApiKey } from './api/openrouter'
import { ActTransition } from './components/ActTransition'
import { AIConversation } from './components/AIConversation'
import { ChoiceList } from './components/ChoiceList'
import { DialogueBox } from './components/DialogueBox'
import { EndingCard } from './components/EndingCard'
import { LeaderboardPanel } from './components/Leaderboard'
import { SceneBackground } from './components/SceneBackground'
import { StatBar } from './components/StatBar'
import { DEFAULT_MODEL } from './config'
import { CHARACTERS } from './game/characters'
import { currentAct, GameContext, initialState, reducer, useGame } from './game/gameState'
import { TRACKS, useBackgroundMusic } from './hooks/useBackgroundMusic'
import roadImg from './assets/backgrounds/road.jpeg'
import type { Character, EffectsNode, PlayerStats, SceneNode } from './types/game'

function MusicToggle({ muted, onToggle }: { muted: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      title={muted ? 'Unmute music' : 'Mute music'}
      className="fixed right-3 top-3 z-40 flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-noir-950/70 text-sm text-white/70 backdrop-blur-sm transition-colors hover:border-neon-pink/60 hover:text-white"
    >
      {muted ? '🔇' : '🔊'}
    </button>
  )
}

function StartScreen({ onStart, soundBlocked }: { onStart: () => void; soundBlocked: boolean }) {
  const [showLb, setShowLb] = useState(false)
  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center overflow-hidden px-6 text-center">
      {/* road at dusk backdrop */}
      <img
        src={roadImg}
        alt=""
        aria-hidden
        className="animate-fade absolute inset-0 h-full w-full object-cover"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(10,8,4,0.55) 0%, rgba(10,8,4,0.35) 40%, rgba(10,8,4,0.78) 100%)',
        }}
      />
      <span
        className="pointer-events-none absolute top-2 left-1/2 -translate-x-1/2 font-display text-[min(24vw,150px)] leading-none text-white/10 select-none animate-flicker"
        aria-hidden
      >
        檳
      </span>
      <div className="animate-rise relative flex flex-col items-center">
        <h1 className="font-display text-6xl font-black text-gold-throne gold-text sm:text-7xl">
          檳榔王國
        </h1>
        <h2 className="mt-3 font-display text-lg font-bold tracking-[0.35em] text-white/90">
          BETEL NUT EMPIRE
        </h2>
        <p className="mt-6 max-w-sm text-sm italic leading-relaxed text-white/75">
          A truck. A neon-lit stand. A road that only goes up — if you survive the climb.
        </p>
        <button
          type="button"
          onClick={onStart}
          className="mt-10 rounded-lg border border-gold-throne/60 bg-black/40 px-10 py-3 font-display text-base font-bold tracking-widest text-white transition-all hover:bg-gold-throne/20 hover:shadow-[0_0_28px_rgba(212,175,55,0.5)]"
        >
          開始 · START
        </button>
        <button
          type="button"
          onClick={() => setShowLb(true)}
          className="mt-3 rounded-lg border border-white/20 bg-black/30 px-5 py-1.5 text-[11px] font-bold tracking-widest text-white/60 transition-all hover:border-gold-throne/60 hover:text-white"
        >
          排行榜 · LEADERBOARD
        </button>
        <p className="mt-8 text-[10px] text-white/45">
          {hasApiKey ? (
            <>AI dialogue live via OpenRouter · {DEFAULT_MODEL}</>
          ) : (
            <>Offline mode — set VITE_OPENROUTER_API_KEY for live AI dialogue</>
          )}
        </p>
        <p className="mt-2 max-w-sm text-[10px] leading-relaxed text-white/35">
          A work of fiction. All characters, gangs, and places are invented; any resemblance to
          real persons or organizations is coincidental.
        </p>
        <a
          href="https://www.instagram.com/jw.cheng"
          target="_blank"
          rel="noreferrer"
          className="mt-4 flex items-center gap-1 text-[10px] text-white/40 transition-colors hover:text-white/75"
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden
          >
            <rect x="2" y="2" width="20" height="20" rx="5" />
            <circle cx="12" cy="12" r="4.5" />
            <circle cx="17.2" cy="6.8" r="1.3" fill="currentColor" stroke="none" />
          </svg>
          jw.cheng
        </a>
        <a
          href="https://github.com/jwcheng/betel-nut-simulator"
          target="_blank"
          rel="noreferrer"
          className="mt-1.5 flex items-center gap-1 text-[10px] text-white/40 transition-colors hover:text-white/75"
        >
          <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.42 7.42 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
          </svg>
          star it on GitHub
        </a>
        {soundBlocked && (
          <p className="animate-blink mt-3 text-[10px] tracking-wide text-gold-throne/70">
            ♪ click anywhere for sound
          </p>
        )}
      </div>

      {showLb && (
        <div
          className="absolute inset-0 z-40 flex items-center justify-center bg-black/70 p-5 backdrop-blur-sm"
          onClick={() => setShowLb(false)}
        >
          <div
            className="animate-rise w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <LeaderboardPanel />
            <button
              type="button"
              onClick={() => setShowLb(false)}
              className="mt-3 w-full rounded-lg border border-white/20 bg-black/40 px-5 py-2 text-xs font-bold tracking-widest text-white/70 transition-all hover:border-gold-throne/60 hover:text-white"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function InstructionsScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center overflow-hidden px-6 text-center">
      <img
        src={roadImg}
        alt=""
        aria-hidden
        className="animate-fade absolute inset-0 h-full w-full object-cover"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(10,8,4,0.82) 0%, rgba(10,8,4,0.72) 40%, rgba(10,8,4,0.9) 100%)',
        }}
      />
      <div className="animate-rise relative flex max-h-full w-full max-w-xl flex-col items-center overflow-y-auto py-8">
        <h1 className="font-display text-3xl font-black text-gold-throne gold-text">
          玩法 · HOW IT WORKS
        </h1>
        <div className="mt-5 space-y-3 text-left text-[13px] leading-relaxed text-white/80">
          <p>
            You're a young truck driver hauling betel nut into Taipei. Five acts stand between
            the neon stands of Wanxia District and the seat at the top of the organization.
          </p>
          <p>
            <span className="font-bold text-gold-throne">The people here are alive.</span> Every
            character is connected to a live AI — nothing they say is scripted. They hear what
            you actually type and answer in character, so talk to them like real people: charm,
            negotiate, bluff.
          </p>
          <p>
            <span className="font-bold text-gold-throne">Trust opens doors.</span> Every line you
            say is judged. The meter under a character's name shows where you stand; the tick
            (like <span className="tabular-nums">23/50</span>) is what you need to advance. The
            hint under their name tells you what they respect — and despise.
          </p>
          <p>
            <span className="font-bold text-gold-throne">Watch your stats.</span> Choices move
            Cash 現金, Reputation 聲望, Charm 魅力, and Heat 風聲. Some paths need minimums — and
            Heat is police attention. Allies you win along the way will count at the end.
          </p>
        </div>
        <button
          type="button"
          onClick={onContinue}
          className="mt-8 rounded-lg border border-gold-throne/60 bg-black/40 px-10 py-3 font-display text-base font-bold tracking-widest text-white transition-all hover:bg-gold-throne/20 hover:shadow-[0_0_28px_rgba(212,175,55,0.5)]"
        >
          上路 · HIT THE ROAD
        </button>
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

/** which character is on screen for this node, if any */
function activeCharacter(node: SceneNode | undefined): Character | null {
  if (!node) return null
  if (node.kind === 'ai') return CHARACTERS[node.character]
  if (node.kind === 'line' && node.speaker !== 'narrator' && node.speaker !== 'player')
    return CHARACTERS[node.speaker]
  return null
}

/** VN-style centered portrait card, shown while that character is speaking */
function CharacterOverlay({ character }: { character: Character }) {
  if (!character.portraitUrl) return null
  return (
    <div className="pointer-events-none absolute inset-x-0 top-12 z-[5] flex justify-center">
      <img
        key={character.id}
        src={character.portraitUrl}
        alt={character.name}
        className="animate-rise h-[46vh] max-h-[440px] rounded-xl border border-white/15 object-cover object-top"
        style={{
          aspectRatio: '2 / 3',
          boxShadow: `0 12px 50px rgba(0,0,0,0.65), 0 0 60px ${character.color}44`,
        }}
      />
    </div>
  )
}

function Stage({ muted, onToggleMute }: { muted: boolean; onToggleMute: () => void }) {
  const { state } = useGame()
  const act = currentAct(state)
  const node = act.nodes[state.nodeId]
  const bgSpec = act.backgrounds[state.bg] ?? act.backgrounds[act.defaultBg]
  const speaking = activeCharacter(node)

  return (
    <>
      <SceneBackground spec={bgSpec} />
      {speaking && <CharacterOverlay character={speaking} />}
      <StatBar muted={muted} onToggleMute={onToggleMute} />
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

function Game({
  helpOpen,
  onShowHelp,
  onBeginStory,
  soundBlocked,
  muted,
  onToggleMute,
}: {
  helpOpen: boolean
  onShowHelp: () => void
  onBeginStory: () => void
  soundBlocked: boolean
  muted: boolean
  onToggleMute: () => void
}) {
  const { state, dispatch } = useGame()

  switch (state.phase) {
    case 'start':
      return helpOpen ? (
        <InstructionsScreen onContinue={onBeginStory} />
      ) : (
        <StartScreen onStart={onShowHelp} soundBlocked={soundBlocked} />
      )
    case 'transition':
      return <ActTransition act={currentAct(state)} onContinue={() => dispatch({ type: 'BEGIN_ACT' })} />
    case 'ending':
      return <EndingCard />
    case 'playing':
      return <Stage muted={muted} onToggleMute={onToggleMute} />
  }
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, undefined, initialState)
  const [helpOpen, setHelpOpen] = useState(false)

  // title/instructions + act 2 + credits: taiwan · acts 1, 3, 4: underworld ·
  // the act 5 finale: stretch
  const track =
    state.phase === 'start' || state.phase === 'ending'
      ? TRACKS.taiwan
      : state.act === 5
        ? TRACKS.stretch
        : state.act === 2
          ? TRACKS.taiwan
          : TRACKS.underworld
  const music = useBackgroundMusic(track)

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      <div className="relative h-full w-full overflow-hidden bg-noir-950">
        {state.phase !== 'start' && state.phase !== 'playing' && (
          <MusicToggle muted={music.muted} onToggle={music.toggleMute} />
        )}
        <Game
          helpOpen={helpOpen}
          onShowHelp={() => setHelpOpen(true)}
          onBeginStory={() => {
            setHelpOpen(false)
            dispatch({ type: 'START_GAME' })
          }}
          soundBlocked={music.blocked}
          muted={music.muted}
          onToggleMute={music.toggleMute}
        />
      </div>
    </GameContext.Provider>
  )
}
