import { API_FAIL_TRUST_DELTA, HISTORY_WINDOW, OFFLINE_TRUST_DELTA } from '../config'
import type { Character, ChatMessage, Mood, NPCReply, PlayerStats } from '../types/game'

/**
 * All OpenRouter traffic goes through this serverless proxy — the API key
 * lives only in the server env (OPENROUTER_API_KEY), never in the bundle.
 */
const DIALOGUE_URL = '/api/dialogue'

let livePromise: Promise<boolean> | null = null

/**
 * Whether the server has an OpenRouter key configured. Checked once per
 * session. Under plain `vite` dev there is no /api, so this resolves false —
 * accurate: that's offline mode (use `vercel dev` for live AI locally).
 */
export function checkAiLive(): Promise<boolean> {
  livePromise ??= fetch(DIALOGUE_URL)
    .then((res) => (res.ok ? (res.json() as Promise<{ live?: boolean }>) : { live: false }))
    .then((d) => Boolean(d.live))
    .catch(() => false)
  return livePromise
}

const VALID_MOODS: Mood[] = ['friendly', 'neutral', 'suspicious', 'hostile', 'impressed']

function trustGuidance(trust: number): string {
  if (trust >= 75) return 'You genuinely like and trust the player. Warm, open, loyal.'
  if (trust >= 55) return 'You respect the player and are warming to them. Guard lowered, but not gone.'
  if (trust >= 35) return 'You are neutral-to-wary. Professional, measured, still testing them.'
  if (trust >= 15) return 'You are suspicious of the player. Short answers, probing questions, no favors.'
  return 'You distrust or dislike the player. Cold, dismissive, possibly hostile.'
}

function buildSystemPrompt(
  character: Character,
  sceneContext: string,
  trust: number,
  stats: PlayerStats,
  secretBrief?: string,
  steerToSecret?: boolean,
): string {
  return `You are roleplaying ${character.name} (${character.nameZh}), an NPC in "Betel Nut Empire" (檳榔王國), a fictional Taiwanese crime-drama visual novel in the tradition of gangster films like Monga and Gatao. Stylized, dramatic, morally grey — never gratuitous.

CHARACTER:
${character.systemPrompt}

CURRENT SCENE:
${sceneContext}

RELATIONSHIP:
Your trust in the player is ${trust}/100. ${trustGuidance(trust)}

PLAYER SNAPSHOT (what someone in your world would sense about them):
Cash NT$${stats.cash.toLocaleString()}, gang reputation ${stats.reputation}/200, charm ${stats.charm}/100, police heat ${stats.heat}/100.
${
  secretBrief
    ? `
HIDDEN TRUTH (never volunteer it unprompted):
${secretBrief}
This truth colors your whole manner in this scene: you are protective of it, opinionated around it, and you notice when the player gets close.
REVEAL RULES — check in this order:
1. The player's message directly asks about or names the SUBJECT of this truth — even bluntly, clumsily, or partially → REVEAL IT NOW in this reply. A direct on-topic ask always wins; the "reveal only..." wording in the brief governs indirect approaches and NEVER blocks a direct question. (A generic fishing line like "what's your secret?" with no subject does not count.)
2. The message meets the reveal condition described in the brief → reveal it.
3. Neither → keep it hidden, set "secret_hit":false, and do not hint at its existence.
Revealing means stating the truth plainly in your dialogue, in character, in THIS reply — not teasing it for later. Whenever your dialogue states the truth, you MUST set "secret_hit":true on that same reply.`
    : ''
}

RULES:
- Stay in character. Never mention being an AI or a game.
- Reply in ENGLISH. You may sprinkle in AT MOST one or two short Traditional Chinese or Taiwanese words per reply (e.g. 哎唷, 兄弟, 少年仔) for flavor — NEVER write a full Chinese sentence or clause. English speakers must understand every reply completely without translation.
- If the player asks you to speak English (or says they don't understand Chinese), drop the Chinese words entirely and reply in plain English from then on.
- 1 to 4 sentences MAXIMUM. Punchy, filmic visual-novel dialogue, not prose.
- Judge the player's line and set trust_delta. Be a HARSH, even-handed judge — over a conversation roughly a third of lines should land positive, a third neutral (0), a third negative. Ordinary, safe, or merely pleasant lines are worth 0: trust is EARNED, never accumulated by just talking. A line that genuinely hits what you respect: +5 to +10; one that truly impresses you: +11 to +15 (rare). Lazy, repetitive, evasive, or try-hard lines: -5 to -10; lines you genuinely despise: -11 to -15. Let your mood swing visibly with the number — flash suspicious or hostile the moment something lands wrong, warm quickly when something lands right.
- Also judge small stat effects, each -3 to +3 and usually 0 — set them ONLY when the line clearly earns it:
  charm_delta: wit, smoothness, magnetism earn +1 to +3; awkward or cringeworthy lines -1 to -2.
  rep_delta: spine, street-smart moves, keeping face earn +1 to +3; grovelling or losing face -1 to -2.
  heat_delta: reckless talk (naming crimes aloud, threats, bragging where ears might hear) +1 to +3; deliberate discretion at a tense moment -1.
- Content line: this is crime FICTION — scheming, smuggling, in-story threats and power plays are all fair game and must NOT be flagged. But if the player's message crosses real-world lines — explicit sexual content or sexual advances, anything sexual involving minors, graphic gratuitous gore/torture, slurs or hate speech, or reveling in murder in graphic detail — set "flag":"offensive". Otherwise "flag":"".
- "wrap": set true ONLY when this scene's business is genuinely settled from your side — a deal struck, instructions given, an understanding reached — and you would naturally end the conversation here on good terms. Never wrap in your first couple of replies, never while you still distrust the player, and never as a brush-off.
- "suggestion": write ONE fresh line the PLAYER could say next — first person, the player's voice, under 120 characters — that would genuinely move THIS conversation somewhere new. Never repeat anything already said or suggested.${
    steerToSecret
      ? ' The hidden truth is still buried: make this suggestion a line that would genuinely draw you toward revealing it — a question or approach that fits the reveal condition in the brief.'
      : ''
  }
- Respond with ONLY a minified JSON object, no markdown fences, exactly this shape:
{"dialogue":"...","trust_delta":0,"mood":"friendly|neutral|suspicious|hostile|impressed","charm_delta":0,"rep_delta":0,"heat_delta":0,"flag":"","secret_hit":false,"wrap":false,"suggestion":"..."}`
}

function parseReply(raw: string): NPCReply | null {
  const start = raw.indexOf('{')
  const end = raw.lastIndexOf('}')
  if (start === -1 || end <= start) return null
  try {
    const obj = JSON.parse(raw.slice(start, end + 1)) as Record<string, unknown>
    if (typeof obj.dialogue !== 'string' || obj.dialogue.length === 0) return null
    const num = (v: unknown, lo: number, hi: number) => {
      const n = Number(v)
      return Number.isFinite(n) ? Math.max(lo, Math.min(hi, Math.round(n))) : 0
    }
    const mood = VALID_MOODS.includes(obj.mood as Mood) ? (obj.mood as Mood) : 'neutral'
    return {
      dialogue: obj.dialogue,
      trust_delta: num(obj.trust_delta, -15, 15),
      mood,
      charm_delta: num(obj.charm_delta, -3, 3),
      rep_delta: num(obj.rep_delta, -3, 3),
      heat_delta: num(obj.heat_delta, -3, 3),
      flag: obj.flag === 'offensive' ? 'offensive' : '',
      secret_hit: obj.secret_hit === true,
      wrap: obj.wrap === true,
      suggestion: typeof obj.suggestion === 'string' ? obj.suggestion.trim().slice(0, 140) : '',
    }
  } catch {
    return null
  }
}

const fallbackIndex: Partial<Record<string, number>> = {}

function fallbackReply(character: Character, trust: number, offline: boolean): NPCReply {
  const i = fallbackIndex[character.id] ?? 0
  fallbackIndex[character.id] = i + 1
  const mood: Mood = trust >= 60 ? 'friendly' : trust >= 35 ? 'neutral' : 'suspicious'
  return {
    dialogue: character.fallbackLines[i % character.fallbackLines.length],
    trust_delta: offline ? OFFLINE_TRUST_DELTA : API_FAIL_TRUST_DELTA,
    mood,
  }
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

/**
 * Single funnel for all NPC dialogue. Calls OpenRouter through the
 * /api/dialogue proxy, expects structured JSON back, retries once on
 * garbage, then falls back to a scripted in-character line. With no key
 * configured server-side it runs fully offline.
 */
export async function callOpenRouter(
  character: Character,
  playerMessage: string,
  history: ChatMessage[],
  trustScore: number,
  stats: PlayerStats,
  sceneContext: string,
  secretBrief?: string,
  steerToSecret?: boolean,
): Promise<NPCReply> {
  if (!(await checkAiLive())) {
    await delay(500)
    return fallbackReply(character, trustScore, true)
  }

  const messages = [
    { role: 'system', content: buildSystemPrompt(character, sceneContext, trustScore, stats, secretBrief, steerToSecret) },
    ...history.slice(-HISTORY_WINDOW),
    { role: 'user', content: playerMessage },
  ]

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(DIALOGUE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages:
            attempt === 0
              ? messages
              : [
                  ...messages,
                  {
                    role: 'user',
                    content:
                      'Reminder: respond with ONLY the minified JSON object, nothing else.',
                  },
                ],
        }),
      })
      if (!res.ok) throw new Error(`dialogue proxy ${res.status}`)
      const data = (await res.json()) as { content?: string }
      const content = data.content
      if (content) {
        const parsed = parseReply(content)
        if (parsed) return parsed
      }
    } catch (err) {
      console.warn(`OpenRouter call failed (attempt ${attempt + 1})`, err)
    }
  }
  return fallbackReply(character, trustScore, false)
}
