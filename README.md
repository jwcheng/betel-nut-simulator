# 檳榔王國 · Betel Nut Empire

PUBLIC LINK HERE:
https://betel-nut-simulator.vercel.app/

A browser-based visual novel RPG set in a fictionalized Taiwan. You start as a truck driver, stumble onto a neon-lit betel nut stand in Taipei, and climb a criminal organization across five acts — from the southern farms to the throne itself.

Fictional crime drama in the tradition of Taiwanese gangster films (Monga, Gatao). No real people, gangs, or literal locations.

## Stack

- React 19 + Vite + TypeScript
- Tailwind CSS v4 (`@theme` tokens in `src/index.css`, no config file)
- OpenRouter API for dynamic NPC dialogue (default model: `anthropic/claude-sonnet-4.6`)
- Pure client-side SPA — no backend, no database, no localStorage; all state lives in a React reducer

## Run it

```bash
npm install
cp .env.local.example .env.local   # add your OpenRouter key
npm run dev
```

No key? The game still runs in **offline mode**: NPCs answer with scripted fallback lines and each exchange grants +8 trust so every act gate stays passable. A badge on the conversation panel shows which mode you're in.

## Config knobs (`src/config.ts`)

- `DEFAULT_MODEL` — swap to `anthropic/claude-haiku-4.5` or an open model for cheaper testing
- `MAX_TOKENS` / `TEMPERATURE` / `HISTORY_WINDOW` — per-call cost bounds
- `OFFLINE_TRUST_DELTA` — trust granted per exchange without a key

## How it's wired

```
src/
  api/openrouter.ts      callOpenRouter() — every NPC call funnels here.
                         Requests strict JSON {dialogue, trust_delta, mood},
                         retries once on garbage, then falls back in character.
  game/
    gameState.ts         Reducer + context: stats, NPC trust/history, flags, act gating.
    characters.ts        The five NPCs: system prompts, colors, fallback lines.
    acts/act1..5.ts      Scene scripts as node graphs (narration | line | choice |
                         ai | effects | gate | allyCheck | endAct).
  components/            DialogueBox, ChoiceList, AIConversation, StatBar,
                         SceneBackground, TrustMeter, ActTransition, EndingCard.
```

Player stats: **Cash** (NT$), **Reputation** (unlocks act gates), **Charm** (unlocks dialogue options), **Heat** (≥70 triggers shakedown events).

Act gates: Act 1 — Long's trust ≥ 50 · Act 2 — Tsai's trust ≥ 55 · Act 3 — Reputation ≥ 50 (makeup runs loop until you clear it) · Act 4 — at least one ally · Act 5 — endings branch on final stats: **Bloody Coup**, **Negotiated Succession**, or **Betrayed and Cast Out**.

## Art

Backgrounds are gradient + giant-glyph placeholders. Each scene's `BackgroundSpec` (in the act files) accepts an `imageUrl` — drop in real illustrations per scene and they render as full-bleed panels with the same vignette.

## Deploy

Static build, deploys anywhere: `npm run build` → `dist/`. On Vercel, set `VITE_OPENROUTER_API_KEY` in project env settings. Note: a client-side key is visible to players — for a public link, either ship offline mode or set a spend limit on the key.
