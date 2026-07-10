# 檳榔王國 · Betel Nut Empire

PUBLIC LINK HERE:
https://betel-nut-simulator.vercel.app/

A browser-based visual novel RPG set in a fictionalized Taiwan. You start as a truck driver, stumble onto a neon-lit betel nut stand in Taipei, and climb a criminal organization across five acts — from the southern farms to the throne itself.

Fictional crime drama in the tradition of Taiwanese gangster films (Monga, Gatao). No real people, gangs, or literal locations.

## Stack

- React 19 + Vite + TypeScript
- Tailwind CSS v4 (`@theme` tokens in `src/index.css`, no config file)
- OpenRouter API for dynamic NPC dialogue (default model: `deepseek/deepseek-v4-flash`), proxied through a serverless function so the key never ships to the browser
- Upstash Redis (via Vercel Marketplace) + two Vercel serverless functions: the global leaderboard and the rate-limited dialogue proxy
- Manga-style illustrated scenes and character portraits (`src/assets/`), three-track MP3 soundtrack (`public/audio/`)
- Game state is a single React reducer — no localStorage, every run starts fresh

## Run it

```bash
npm install
cp .env.local.example .env.local   # add your OpenRouter key (OPENROUTER_API_KEY)
vercel dev                         # serves the SPA + the api/ functions
```

Plain `npm run dev` also works but has no `api/` routes, so it always runs in **offline mode**: NPCs answer with scripted fallback lines and each exchange grants +8 trust so every act gate stays passable. A badge on the conversation panel shows which mode you're in. (The leaderboard needs the Upstash env vars — see below — and silently shows "unreachable" without them.)

## Config knobs (`src/config.ts`)

- `DEFAULT_MODEL` — any OpenRouter model id
- `MAX_TOKENS` / `TEMPERATURE` / `HISTORY_WINDOW` — per-call cost bounds
- `OFFLINE_TRUST_DELTA` / `API_FAIL_TRUST_DELTA` — trust granted per exchange when the AI is unavailable, so outages can't strand a run

## How it's wired

```
api/
  leaderboard.ts         Vercel serverless function — GET top scores, POST a run.
  dialogue.ts            Vercel serverless function — proxies chat completions to
                         OpenRouter. Holds the API key (server env, never bundled),
                         pins the model + token caps, validates messages, and
                         rate-limits per IP (15/min) via the same Upstash Redis.
src/
  api/openrouter.ts      callOpenRouter() — every NPC call funnels here, via
                         POST /api/dialogue. Requests strict JSON {dialogue,
                         trust_delta, mood, charm_delta, rep_delta, heat_delta},
                         retries once on garbage, then falls back in character.
  hooks/
    useBackgroundMusic.ts Looping soundtrack with per-act track switching and
                         self-healing resume (autoplay policy, media keys).
  game/
    gameState.ts         Reducer + context: stats, NPC trust/history, flags, act gating.
    characters.ts        The five NPCs: system prompts, portraits, hints, fallback lines.
    acts/act1..5.ts      Scene scripts as node graphs (narration | line | choice |
                         ai | effects | gate | allyCheck | endAct).
  components/            DialogueBox, ChoiceList, AIConversation, StatBar,
                         SceneBackground, TrustMeter, ActTransition, EndingCard,
                         Leaderboard.
```

Player stats: **Cash** (NT$), **Reputation** (caps at 200), **Charm**, **Heat** (cap at 100). Scripted choices move them — and so does the AI: every chat line is judged for small charm/rep/heat deltas alongside trust.

Trust gates per encounter: Ah-Mei 30 → Long 35 → Tsai 55 → Long 70 → Long 90 → Hsu 60 / Ah-Mei 50 / Long 100 (Act 4) → Kuo 100. Failing a gate shows a low-trust notice and reopens the conversation. Endings branch on final stats: **Bloody Coup**, **Negotiated Succession**, or **Betrayed and Cast Out**.

Every AI encounter also hides a **secret** (`secret` on the AI node): a hidden truth injected into the system prompt that the character guards until the player's line genuinely earns the reveal — the model flags that moment via `secret_hit` for a one-time trust bonus (+16 to +30). Two fail states end a run outright: any character's trust hitting 0, or the model flagging genuinely offensive player input.

## Leaderboard

Global, ranked by **Ovr** (overall score): `Ovr = (Cash/1000) + (Rep/2) + Charm − Heat`, computed server-side. Cash, rep, charm, and heat are all recorded and shown. Visible from the title screen (排行榜 button) and the ending screen, where you can carve your name after a run.

How it works:

- **Storage:** an Upstash Redis sorted set (key `lb`), provisioned free through the Vercel Marketplace and attached to this project. Score = Ovr; the member is a JSON blob `{n, c, r, ch, h, o, e, t}` (name, cash, rep, charm, heat, ovr, ending id, timestamp). The set is trimmed to the top 500 on every write.
- **API:** `api/leaderboard.ts`, one serverless endpoint. `GET` returns the top 50 (client shows 10). `POST` validates and clamps input (name ≤ 20 chars, HTML stripped, numbers bounded), computes Ovr from the submitted stats, and `ZADD`s the entry. Reads the `KV_REST_API_URL` / `KV_REST_API_TOKEN` env vars that the Upstash integration injects.
- **Client:** `src/components/Leaderboard.tsx` — one shared panel; the ending screen passes `allowSubmit` to add the name form.
- **Honesty note:** scores are submitted from the browser, so they're spoofable with dev tools. It's a fun-run leaderboard, not an anti-cheat system.

## Art

13 illustrated scene backgrounds and 5 character portraits live in `src/assets/`, wired via `imageUrl` on each scene's `BackgroundSpec` and `portraitUrl` on each character. Portraits render as a centered card while that character speaks. Prompts used to generate the full set are in `ART-PROMPTS.md`.

## Deploy

Push to `main` — Vercel builds from GitHub (static SPA + the `api/` functions). Env needed in Vercel: `OPENROUTER_API_KEY` (server-side only, read by `api/dialogue.ts`) plus the Upstash vars, which the marketplace integration manages automatically. The key never appears in the client bundle; players talk to `/api/dialogue`, which pins the model, caps tokens, and rate-limits per IP. Still worth a spend limit on the key as a backstop.