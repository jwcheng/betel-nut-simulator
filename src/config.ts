/**
 * Central knobs. Swap DEFAULT_MODEL to a cheaper model during testing, e.g.
 * 'anthropic/claude-haiku-4.5' or an open model on OpenRouter.
 */
export const DEFAULT_MODEL = 'deepseek/deepseek-v4-flash'
export const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'
export const MAX_TOKENS = 200
export const TEMPERATURE = 0.8
/** messages of NPC history sent per request (keeps token cost bounded) */
export const HISTORY_WINDOW = 12
/**
 * With no API key the game runs in "offline mode": NPCs answer with scripted
 * fallback lines and every exchange grants this much trust, so act gates stay
 * passable during development.
 */
export const OFFLINE_TRUST_DELTA = 8
/**
 * Trust granted when the API errors out mid-game (rate limit, outage) and a
 * scripted fallback line is served. Nonzero so a flaky connection can never
 * strand the player in front of a trust gate.
 */
export const API_FAIL_TRUST_DELTA = 4
