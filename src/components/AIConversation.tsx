import { useEffect, useRef, useState } from 'react'
import { callOpenRouter } from '../api/openrouter'
import { CHARACTERS } from '../game/characters'
import { useGame } from '../game/gameState'
import { secretWorth } from '../game/secrets'
import { useAiLive } from '../hooks/useAiLive'
import type { AINode } from '../types/game'
import { Portrait } from './Portrait'
import { TrustMeter } from './TrustMeter'

export function AIConversation({ node }: { node: AINode }) {
  const { state, dispatch } = useGame()
  const aiLive = useAiLive()
  const character = CHARACTERS[node.character]
  const npc = state.npcs[node.character]

  const [input, setInput] = useState('')
  const [pending, setPending] = useState<string | null>(null)
  const [statFx, setStatFx] = useState<{ label: string; bad: boolean }[]>([])
  // live suggestion chips: used ones get replaced by fresh AI-written lines
  const [chips, setChips] = useState<string[]>(node.suggestions)
  const scrollRef = useRef<HTMLDivElement>(null)

  // no minimum-exchange requirement — the trust gates are the only doors
  const canExit = pending === null
  const gateCleared = !node.gate || npc.trust >= node.gate.minTrust
  const secretFound = node.secret ? Boolean(state.flags[node.secret.id]) : false

  useEffect(() => {
    dispatch({ type: 'NPC_OPENER', character: node.character, opener: node.opener, nodeId: node.id })
  }, [dispatch, node.character, node.opener, node.id])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [npc.history.length, pending])

  async function send(message: string, usedChip?: string) {
    const text = message.trim()
    if (!text || pending !== null) return
    setInput('')
    setPending(text)
    const sceneContext = `${node.sceneContext}\nRecent events in the player's story: ${
      state.log.slice(-6).join(' ') || 'The story is just beginning.'
    }`
    const secretActive = node.secret && !secretFound ? node.secret : undefined
    // secret still buried after two full exchanges: the model's fresh
    // suggestion chip starts steering the player toward it
    const steerToSecret = Boolean(secretActive) && npc.history.length >= 5
    const reply = await callOpenRouter(
      character,
      text,
      npc.history,
      npc.trust,
      state.stats,
      sceneContext,
      secretActive?.brief,
      steerToSecret,
    )
    dispatch({
      type: 'NPC_TURN',
      character: node.character,
      playerMessage: text,
      reply,
      secret: secretActive
        ? { flag: secretActive.id, bonus: secretActive.bonus, effects: secretActive.effects }
        : undefined,
      gateTarget: node.gate?.minTrust,
    })
    // keep exactly 3 chips alive: drop the used one, prefer the model's fresh
    // suggestion, and recycle originals if the fresh one is empty/duplicate
    setChips((prev) => {
      let next = usedChip ? prev.filter((c) => c !== usedChip) : [...prev]
      const fresh = (reply.suggestion ?? '').trim()
      // steering mode: the fresh chip leads toward the secret, so retire the
      // oldest chip to guarantee it a slot even when the player typed manually
      if (steerToSecret && !reply.secret_hit && !usedChip && next.length >= 3 && fresh.length > 4 && !next.includes(fresh)) {
        next = next.slice(1)
      }
      if (next.length < 3 && fresh.length > 4 && !next.includes(fresh)) next.push(fresh)
      for (const orig of node.suggestions) {
        if (next.length >= 3) break
        if (!next.includes(orig)) next.push(orig)
      }
      return next
    })
    const fx: { label: string; bad: boolean }[] = []
    const sign = (n: number) => (n > 0 ? `+${n}` : `${n}`)
    if (reply.wrap && node.gate && npc.trust < node.gate.minTrust)
      fx.push({ label: `成交 · DEAL SEALED — trust ${node.gate.minTrust}`, bad: false })
    if (reply.secret_hit && secretActive) {
      fx.push({ label: `秘密 SECRET UNCOVERED +${secretActive.bonus} trust`, bad: false })
      const e = secretActive.effects ?? {}
      if (e.cash) fx.push({ label: `${sign(e.cash)} Cash`, bad: e.cash < 0 })
      if (e.reputation) fx.push({ label: `${sign(e.reputation)} Rep`, bad: e.reputation < 0 })
      if (e.charm) fx.push({ label: `${sign(e.charm)} Charm`, bad: e.charm < 0 })
      if (e.heat) fx.push({ label: `${sign(e.heat)} Heat`, bad: e.heat > 0 })
    }
    if (reply.charm_delta) fx.push({ label: `${sign(reply.charm_delta)} Charm`, bad: reply.charm_delta < 0 })
    if (reply.rep_delta) fx.push({ label: `${sign(reply.rep_delta)} Rep`, bad: reply.rep_delta < 0 })
    if (reply.heat_delta) fx.push({ label: `${sign(reply.heat_delta)} Heat`, bad: reply.heat_delta > 0 })
    setStatFx(fx)
    setPending(null)
  }

  function exit() {
    if (!canExit) return
    if (node.gate && npc.trust < node.gate.minTrust) {
      dispatch({ type: 'GOTO', node: node.gate.failNext })
    } else {
      dispatch({ type: 'GOTO', node: node.next })
    }
  }

  return (
    <div className="mx-auto flex w-[90%] flex-col overflow-hidden rounded-xl border border-white/10 bg-noir-900/92 shadow-[0_8px_40px_rgba(0,0,0,0.6)] backdrop-blur-md">
      {/* header, with character art as a backdrop */}
      <div className="relative flex items-center gap-3 border-b border-white/10 px-3 py-2">
        {character.portraitUrl && (
          <>
            <img
              src={character.portraitUrl}
              alt=""
              aria-hidden
              className="absolute inset-0 h-full w-full object-cover object-top opacity-35"
            />
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(90deg, ${character.color}33 0%, rgba(7,7,15,0.9) 65%, rgba(7,7,15,0.96) 100%)`,
              }}
            />
          </>
        )}
        <div className="relative z-10">
          <Portrait id={character.id} mood={npc.mood} size={44} />
        </div>
        <div className="relative z-10 min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-sm font-bold" style={{ color: character.color }}>
              {character.name}
            </span>
            <span className="text-xs text-white/40">{character.nameZh}</span>
            {!aiLive && (
              <span className="rounded border border-amber-warm/50 px-1 text-[9px] uppercase tracking-wider text-amber-warm">
                offline
              </span>
            )}
          </div>
          <TrustMeter trust={npc.trust} mood={npc.mood} target={node.gate?.minTrust} />
          <p className="mt-0.5 text-[10px] italic leading-tight text-white/45">
            {character.hint}
          </p>
          {node.secret && (
            <p
              className={`mt-0.5 text-[10px] leading-tight ${
                secretFound ? 'text-gold-throne/80' : 'text-white/35'
              }`}
            >
              {secretFound
                ? '🔍 秘密 · secret uncovered'
                : `🔍 an untold truth hides here — worth ${secretWorth(node.secret.bonus, node.secret.effects)}`}
            </p>
          )}
        </div>
      </div>

      {/* transcript — fixed height so the box never grows over the character's face */}
      <div ref={scrollRef} className="h-[calc(16vh_+_20px)] shrink-0 overflow-y-auto px-3 py-2">
        {npc.history.map((m, i) => (
          <div key={i} className={`mb-2 flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <p
              className={`max-w-[85%] rounded-lg px-3 py-1.5 text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'bg-noir-700/80 text-white/85'
                  : 'text-white/95'
              }`}
              style={
                m.role === 'assistant'
                  ? { background: `${character.color}1f`, border: `1px solid ${character.color}44` }
                  : undefined
              }
            >
              {m.content}
            </p>
          </div>
        ))}
        {pending !== null && (
          <>
            <div className="mb-2 flex justify-end">
              <p className="max-w-[85%] rounded-lg bg-noir-700/80 px-3 py-1.5 text-sm text-white/85">
                {pending}
              </p>
            </div>
            <div className="mb-2 flex justify-start">
              <p
                className="rounded-lg px-3 py-1.5 text-sm tracking-widest animate-blink"
                style={{ color: character.color }}
              >
                ● ● ●
              </p>
            </div>
          </>
        )}
      </div>

      {/* stat effects from the last exchange */}
      {statFx.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-3 pb-1">
          {statFx.map((f, i) => (
            <span
              key={i}
              className={`animate-rise rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                f.bad
                  ? 'border-neon-red/60 text-neon-red'
                  : 'border-gold-throne/60 text-gold-throne'
              }`}
            >
              {f.label}
            </span>
          ))}
        </div>
      )}

      {/* suggestions — each used chip is replaced by a fresh AI-written one */}
      <div className="flex flex-wrap gap-1.5 px-3 pb-2">
        {chips.map((s) => (
          <button
            key={s}
            type="button"
            disabled={pending !== null}
            onClick={() => send(s, s)}
            className="rounded-full border border-white/15 bg-noir-800/80 px-2.5 py-1 text-left text-[11px] text-white/70 transition-colors hover:border-neon-pink/60 hover:text-white disabled:opacity-40"
          >
            {s}
          </button>
        ))}
      </div>

      {/* input + exit */}
      <div className="flex gap-2 border-t border-white/10 p-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') send(input)
          }}
          disabled={pending !== null}
          placeholder={`Say something to ${character.name}…`}
          // 16px font: anything smaller makes iOS Safari zoom in on focus,
          // which shrinks the page until you're done typing
          className="min-w-0 flex-1 rounded-lg border border-white/15 bg-noir-950/80 px-3 py-2 text-base text-white placeholder-white/30 outline-none focus:border-neon-pink/70 disabled:opacity-50"
        />
        <button
          type="button"
          onClick={() => send(input)}
          disabled={pending !== null || !input.trim()}
          className="rounded-lg bg-neon-pink/90 px-3 py-2 text-sm font-bold text-white transition-all hover:bg-neon-pink disabled:opacity-30"
        >
          說
        </button>
        <button
          type="button"
          onClick={exit}
          disabled={!canExit}
          className={`rounded-lg border px-3 py-2 text-xs transition-all disabled:opacity-30 ${
            gateCleared
              ? 'border-gold-throne bg-gold-throne/15 font-bold text-gold-throne shadow-[0_0_14px_rgba(212,175,55,0.45)]'
              : 'border-white/20 text-white/80 hover:border-gold-throne hover:text-gold-throne'
          }`}
        >
          {node.exitLabel}
        </button>
      </div>
    </div>
  )
}
