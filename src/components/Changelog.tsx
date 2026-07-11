interface Release {
  version: string
  title: string
  items: string[]
}

const RELEASES: Release[] = [
  {
    version: 'v0.11',
    title: '挖 · Worth Digging For',
    items: [
      'Every secret shows its price tag now — next to the 🔍 hint in the conversation, on the how-to-play screen, and in the endgame secrets table',
      'Asking a character point-blank about their secret finally works — a sincere, on-topic question earns the reveal, no more vault-cracking',
      'Leave a truth buried too long and the suggestion chips start digging for you — one will steer toward the secret',
      'Trust judge rebalanced: ordinary lines earn nothing, great lines pay up to +15, bad lines cost up to -15. Earn it — or watch it swing',
      'Type while they talk: the input box stays open while a reply is coming, so you can line up your next move (and your phone keyboard stops closing)',
    ],
  },
  {
    version: 'v0.10',
    title: '無頂 · The Ceiling Comes Off',
    items: [
      'Rep and Charm are uncapped — the climb has no ceiling now (Heat still tops out at 100)',
      'Secrets pay out beyond trust: every hidden truth now moves your stats — big Charm and Rep rewards, dangerous knowledge adds Heat, protective intel burns it off',
      "The exit button glows gold the moment trust clears the scene's gate — you'll know when you're ready to move on",
      "Chat box holds one steady height instead of creeping up over the character's face, and typing on iPhone no longer zooms the page",
    ],
  },
  {
    version: 'v0.9',
    title: '鎖 · The Key Goes in the Vault',
    items: [
      'AI dialogue now flows through a server-side proxy — the OpenRouter key no longer ships in the page, so nobody can lift it from the browser',
      'The proxy pins the model and token caps and rate-limits chatty scripts (15 messages/min per IP) — normal play never notices',
      'Same characters, same brains, zero gameplay changes',
    ],
  },
  {
    version: 'v0.8',
    title: '成交 · A Deal Is a Deal',
    items: [
      'When a character genuinely closes the scene — deal struck, instructions given — trust auto-fills to the gate. No more small-talk grinding after "see you at 3pm"',
      'Suggestion chips are alive now: use one and the LLM writes a fresh replacement that fits where the conversation actually went — always three on deck',
      'Both run on the same reply the character was already sending — zero extra AI calls',
    ],
  },
  {
    version: 'v0.7',
    title: '秘密 · Every Conversation Hides a Truth',
    items: [
      'All 12 encounters now hide a secret — a truth to pry out of the character by steering the conversation the right way',
      'Uncover one for a big one-time trust bonus (+16 to +30) — the LLM itself judges the moment the reveal is genuinely earned',
      'A 🔍 marker in the chat shows when an untold truth remains — dig instead of repeating yourself',
      'Characters carry deeper backstories now (homes they miss, thrones they refused, ledgers they keep) and guard them with opinions',
    ],
  },
  {
    version: 'v0.6',
    title: '斷 · Burned Bridges',
    items: [
      'Hit trust 0 with anyone and it’s over — the bridge is burned and you’re back at the title screen',
      'The LLM now guards the content line: cross into genuinely offensive territory (explicit sexual content, slurs, gratuitous gore) and the street spits you out. In-story crime and scheming are still fair game',
      'Fresh transcripts: each new encounter with a character starts a clean conversation — they remember how you made them feel (trust and mood carry over), not every word you said',
      'Title screen tidied: socials moved up top and easier to see, credits and disclaimer pinned to the bottom',
    ],
  },
  {
    version: 'v0.5',
    title: '排行榜 · The Street Remembers',
    items: [
      'Global leaderboard — carve your name after a run',
      'Ranked by Ovr = (Cash/1000) + (Rep/2) + Charm − Heat. Playing clean beats playing rich',
      'Viewable right here on the title screen',
    ],
  },
  {
    version: 'v0.4',
    title: '信任 · Trust Is the Only Door',
    items: [
      'Minimum-exchange requirements removed — talk as little or as much as you want',
      "Every major encounter has a clear trust gate, from Ah-Mei's easy 30 to Kuo's brutal 100",
      'Failing a gate tells you plainly — and the conversation stays open',
      'Reputation cap raised to 200',
    ],
  },
  {
    version: 'v0.3',
    title: '活人 · The People Woke Up',
    items: [
      'Swapped the brain: dialogue now runs on DeepSeek V4 Flash via OpenRouter. (Launch model was a free-tier Llama that silently rate-limited into canned replies — fixed)',
      'Every reply is a structured LLM verdict: the model judges your line and moves trust, mood, Charm, Rep, and Heat in a single JSON response',
      'Characters got moodier — they reward what they respect and punish lazy or reckless talk',
      'Hints show what each character respects and despises',
      'English-first dialogue, with just a taste of Chinese for flavor',
      'How-it-works screen added before Act 1',
    ],
  },
  {
    version: 'v0.2',
    title: '有聲有色 · Sights & Sounds',
    items: [
      'Full manga-style art: 13 illustrated scenes and portraits for all five characters, generated to one house style',
      'Characters now appear on screen while they speak',
      'Three-track soundtrack that follows the story — city hustle, countryside, and a techno finale',
      'New title screen: the road south at dusk',
    ],
  },
  {
    version: 'v0.1',
    title: '開張 · Opening Night',
    items: [
      'Betel Nut Empire launches: five acts, five characters, three endings',
      'LLM-driven from day one — every conversation is generated live. The characters read what you actually type and answer in character. Nothing they say is scripted',
    ],
  },
]

export function ChangelogPanel({ className = '' }: { className?: string }) {
  return (
    <div
      className={`w-full rounded-xl border border-white/10 bg-black/40 p-4 text-left backdrop-blur-sm ${className}`}
    >
      <h3 className="font-display text-sm font-bold tracking-widest text-white/70">
        更新 · Changelog
      </h3>
      <p className="mt-2 text-[11px] leading-relaxed text-gold-throne/90">
        This is an LLM-powered game — the dialogue is generated live by a language model, so every
        playthrough is different.
      </p>
      <div className="mt-3 max-h-[55vh] space-y-4 overflow-y-auto pr-1">
        {RELEASES.map((r) => (
          <div key={r.version}>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-xs font-bold text-gold-throne">{r.version}</span>
              <span className="text-xs font-bold text-white/80">{r.title}</span>
            </div>
            <ul className="mt-1 space-y-1">
              {r.items.map((it, i) => (
                <li key={i} className="pl-3 text-[11px] leading-relaxed text-white/60">
                  <span className="text-white/30">· </span>
                  {it}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
