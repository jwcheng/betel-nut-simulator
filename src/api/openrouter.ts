import {
  DEFAULT_MODEL,
  HISTORY_WINDOW,
  MAX_TOKENS,
  OFFLINE_TRUST_DELTA,
  OPENROUTER_URL,
  TEMPERATURE,
} from '../config'
import type { Character, ChatMessage, Mood, NPCReply, PlayerStats } from '../types/game'

const API_KEY: string | undefined = import.meta.env.VITE_OPENROUTER_API_KEY

export const hasApiKey = Boolean(API_KEY)

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
): string {
  return `You are roleplaying ${character.name} (${character.nameZh}), an NPC in "Betel Nut Empire" (檳榔王國), a fictional Taiwanese crime-drama visual novel in the tradition of gangster films like Monga and Gatao. Stylized, dramatic, morally grey — never gratuitous.

CHARACTER:
${character.systemPrompt}

CURRENT SCENE:
${sceneContext}

RELATIONSHIP:
Your trust in the player is ${trust}/100. ${trustGuidance(trust)}

PLAYER SNAPSHOT (what someone in your world would sense about them):
Cash NT$${stats.cash.toLocaleString()}, gang reputation ${stats.reputation}/100, charm ${stats.charm}/100, police heat ${stats.heat}/100.

RULES:
- Stay in character. Never mention being an AI or a game.
- Reply in English, sprinkled with Traditional Chinese or Taiwanese phrases where natural.
- 1 to 4 sentences MAXIMUM. Punchy, filmic visual-novel dialogue, not prose.
- Judge the player's line: raise trust_delta for lines that fit what you respect, lower it for lines you despise. Range -10 to +10, usually -5 to +5.
- Respond with ONLY a minified JSON object, no markdown fences, exactly this shape:
{"dialogue":"...","trust_delta":0,"mood":"friendly|neutral|suspicious|hostile|impressed"}`
}

function parseReply(raw: string): NPCReply | null {
  const start = raw.indexOf('{')
  const end = raw.lastIndexOf('}')
  if (start === -1 || end <= start) return null
  try {
    const obj = JSON.parse(raw.slice(start, end + 1)) as Record<string, unknown>
    if (typeof obj.dialogue !== 'string' || obj.dialogue.length === 0) return null
    const delta = Number(obj.trust_delta)
    const mood = VALID_MOODS.includes(obj.mood as Mood) ? (obj.mood as Mood) : 'neutral'
    return {
      dialogue: obj.dialogue,
      trust_delta: Number.isFinite(delta) ? Math.max(-10, Math.min(10, Math.round(delta))) : 0,
      mood,
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
    trust_delta: offline ? OFFLINE_TRUST_DELTA : 0,
    mood,
  }
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

/**
 * Single funnel for all NPC dialogue. Calls OpenRouter, expects structured
 * JSON back, retries once on garbage, then falls back to a scripted
 * in-character line. With no API key it runs fully offline.
 */
export async function callOpenRouter(
  character: Character,
  playerMessage: string,
  history: ChatMessage[],
  trustScore: number,
  stats: PlayerStats,
  sceneContext: string,
): Promise<NPCReply> {
  if (!API_KEY) {
    await delay(500)
    return fallbackReply(character, trustScore, true)
  }

  const messages = [
    { role: 'system', content: buildSystemPrompt(character, sceneContext, trustScore, stats) },
    ...history.slice(-HISTORY_WINDOW),
    { role: 'user', content: playerMessage },
  ]

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(OPENROUTER_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: DEFAULT_MODEL,
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
          max_tokens: MAX_TOKENS,
          temperature: TEMPERATURE,
        }),
      })
      if (!res.ok) throw new Error(`OpenRouter ${res.status}`)
      const data = (await res.json()) as {
        choices?: { message?: { content?: string } }[]
      }
      const content = data.choices?.[0]?.message?.content
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
