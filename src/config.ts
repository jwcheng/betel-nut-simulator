/**
 * Client-side knobs. The model, token, and temperature knobs that govern the
 * actual OpenRouter call live in api/dialogue.ts (the client never talks to
 * OpenRouter directly). DEFAULT_MODEL here is the display copy for the
 * footer — keep it in sync with api/dialogue.ts.
 */
export const DEFAULT_MODEL = 'deepseek/deepseek-v4-flash'
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
