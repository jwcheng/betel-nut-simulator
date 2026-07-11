import type { ActDefinition } from '../../types/game'
import officeImg from '../../assets/backgrounds/office.jpeg'
import teahouseImg from '../../assets/backgrounds/teahouse.jpeg'
import stand2Img from '../../assets/backgrounds/stand2.jpeg'

export const act4: ActDefinition = {
  id: 4,
  title: 'The Rift',
  titleZh: '幫派內鬥',
  tagline: 'The organization is a table with one chair that matters, and everyone has started measuring the legs.',
  cardGradient: 'linear-gradient(160deg, #0d0609 0%, #2a0d18 60%, #55112b 100%)',
  glyph: '裂',
  defaultBg: 'office',
  gateDescription: 'A boss with no brothers is just a target — secure at least one ally before you move.',
  backgrounds: {
    office: {
      gradient: 'linear-gradient(180deg, #120a0e 0%, #26101c 55%, #4a1428 100%)',
      glyph: '派',
      label: 'The route captain’s office · Sanchong',
      imageUrl: officeImg,
    },
    teahouse: {
      gradient: 'linear-gradient(180deg, #150d08 0%, #2e1710 60%, #521f14 100%)',
      glyph: '茶',
      label: 'The Golden Crane tea house · private room',
      imageUrl: teahouseImg,
    },
    stand2: {
      gradient: 'linear-gradient(180deg, #150a1e 0%, #33102e 50%, #7a1244 100%)',
      glyph: '檳',
      imageUrl: stand2Img,
      label: 'Twin Star №3 · Ah-Mei’s corner',
    },
  },
  start: 'a4_intro',
  nodes: {
    a4_intro: {
      id: 'a4_intro',
      kind: 'narration',
      bg: 'office',
      text: 'They give you a desk you never sit at and a title that means the northern routes answer to you now: route captain. Drivers you trained wave from cabs you used to drive. And with the title comes the weather report — the organization is quietly splitting into fronts, and both of them have started returning your calls too quickly.',
      next: 'a4_fx',
    },
    a4_fx: {
      id: 'a4_fx',
      kind: 'effects',
      effects: { reputation: 5 },
      logLine: 'Act 4 — Promoted to route captain of the northern runs.',
      next: 'heat_check4',
    },
    heat_check4: {
      id: 'heat_check4',
      kind: 'gate',
      check: (s) => s.stats.heat < 70,
      passNext: 'hsu_intro',
      failNext: 'shakedown4',
    },
    shakedown4: {
      id: 'shakedown4',
      kind: 'narration',
      text: 'Fame has a price list. A city councilman’s "assistant" visits the office with a photograph of your truck at a checkpoint and a smile like a receipt. Making the photograph go away costs real money now — captains pay captain prices.',
      next: 'shakedown4_fx',
    },
    shakedown4_fx: {
      id: 'shakedown4_fx',
      kind: 'effects',
      effects: { cash: -6000, heat: -20 },
      note: 'NT$6,000 buys the negative and a month of quiet. You start keeping a drawer for this.',
      logLine: 'Act 4 — Bought back a checkpoint photo from a councilman’s fixer.',
      next: 'hsu_intro',
    },
    hsu_intro: {
      id: 'hsu_intro',
      kind: 'narration',
      bg: 'teahouse',
      text: 'The invitation arrives folded inside a box of pineapple cakes: the Golden Crane tea house, private room, eight o’clock. Snake Hsu pours your tea himself — a courtesy with the exact weight of a hook.',
      next: 'hsu_talk',
    },
    hsu_talk: {
      id: 'hsu_talk',
      kind: 'ai',
      character: 'hsu',
      opener: '兄弟! The famous route captain. Sit, sit. You know what I admire about you? You built your name on a highway while the rest of them built theirs at banquets. Men like us — the ones who actually work — we should talk about the future.',
      sceneContext:
        "A private room at the Golden Crane tea house. Snake Hsu is courting the player for his move against Big Brother Kuo. He flatters, probes for grievances, hints that Kuo is old and that Long is 'a good dog with no ambition,' and dangles the northern territories as a prize. He wants the player's trucks and the player's name behind him. He raises trust for ambition, pragmatism, and anyone who plays along; he marks down — while smiling — anyone who preaches loyalty at him. He never states the plot outright; he talks in weather and 'transitions.'",
      suggestions: [
        'I’m listening. What does the future pay?',
        'And where does Brother Long fit in this future of yours?',
        'I drive for the organization, 蛇哥. Whoever’s name is on the door.',
      ],
      minTurns: 2,
      exitLabel: 'Finish the tea',
      next: 'ahmei_intro',
      gate: { minTrust: 60, failNext: 'hsu_lowtrust' },
      secret: {
        id: 'sec_a4_hsu',
        bonus: 20,
        // you saw through the district's best charmer — and now hold his weakness
        effects: { charm: 20, reputation: 12 },
        brief:
          "Hsu's faction is all lieutenants and scooter kids — he has NO transport. Without the player's trucks he cannot move a single crate, and every drop of his charm is cover for that need. If the player presses hard on concrete numbers — how many drivers he actually has, who moves his product tomorrow — he slips, then covers with a wider smile. Reveal only under that specific pressure; vague challenges he deflects easily.",
      },
    },
    hsu_lowtrust: {
      id: 'hsu_lowtrust',
      kind: 'narration',
      text: '信任不足 — not enough trust. Hsu’s smile stays exactly where it is, but the offer stays in his pocket. He needs 60 trust before he talks real numbers. Keep talking.',
      next: 'hsu_talk',
    },
    ahmei_intro: {
      id: 'ahmei_intro',
      kind: 'narration',
      bg: 'stand2',
      text: 'Twin Star is three stands now, and Ah-Mei runs all of them from the newest one — same silver jacket, better watch. Her booths sit on three of the busiest corners in the district, which means her girls see every cop, every courier, and every lieutenant’s car in Wanxia. Nobody gossips to a route captain. Everybody gossips to a betel nut beauty.',
      next: 'ahmei_talk4',
    },
    ahmei_talk4: {
      id: 'ahmei_talk4',
      kind: 'ai',
      character: 'ahmei',
      opener: '哎唷, look who remembers where his story started. Buy something, captain — my girls are watching and I have a reputation for only talking to paying customers.',
      sceneContext:
        "Night at Ah-Mei's newest stand. She and the player go back to Act 1; she now runs three stands whose real value is information — her girls see everything that moves in Wanxia. She is more entangled in the organization than she ever wanted: her stands move product and messages, and both Hsu's and Kuo's people have leaned on her lately. She warns the player that Hsu's scooter kids have been photographing trucks and that Kuo's collectors doubled her 'rent' last month. If trust is high she is openly on the player's side and shares real intelligence; if low, she keeps it transactional. She warms to honesty, remembering details from their first meeting, and concern for her safety that doesn't sound like pity.",
      suggestions: [
        'I never forgot this corner. Or the free advice that saved me in that alley.',
        'What are your girls seeing lately? Trucks, cops, scooters — anything with a pattern.',
        'If this goes bad, I want you and your stands out of the blast radius. Tell me what you need.',
      ],
      minTurns: 2,
      exitLabel: 'Buy the pack and go',
      next: 'ahmei_ally_check',
      gate: { minTrust: 50, failNext: 'ahmei4_lowtrust' },
      secret: {
        id: 'sec_a4_ledger',
        bonus: 20,
        // years of clocked cop cars and couriers — you know where the eyes are
        effects: { heat: -5 },
        brief:
          "Ah-Mei keeps a dated ledger — years of it. Every cop car, courier, and lieutenant's plate her girls have ever clocked in Wanxia, written down. It exists because a betel nut beauty with no protection needs insurance. She has never told anyone. Reveal it only to real concern for her safety that doesn't smell like pity, combined with a direct question about what she actually does with everything her girls see.",
      },
    },
    ahmei4_lowtrust: {
      id: 'ahmei4_lowtrust',
      kind: 'narration',
      text: '信任不足 — not enough trust. Ah-Mei rings up your pack and says nothing worth hearing. Her girls’ eyes cost 50 trust. Keep talking.',
      next: 'ahmei_talk4',
    },
    ahmei_ally_check: {
      id: 'ahmei_ally_check',
      kind: 'allyCheck',
      character: 'ahmei',
      minTrust: 60,
      flag: 'ally_ahmei',
      logLine: 'Act 4 — Ah-Mei’s street network is with you.',
      next: 'long_intro4',
    },
    long_intro4: {
      id: 'long_intro4',
      kind: 'narration',
      bg: 'office',
      text: 'Long finds you the old way — already leaning on your truck when you come out of the warehouse, smoking, watching the loading crews like arithmetic. He doesn’t do tea houses.',
      next: 'long_talk4',
    },
    long_talk4: {
      id: 'long_talk4',
      kind: 'ai',
      character: 'long',
      opener: 'Hsu poured you tea. The old man’s people counted your trucks twice this week. So. Time to answer the only question that matters, 少年仔 — when it moves, where are you standing?',
      sceneContext:
        "Outside the Sanchong warehouse, late. Long knows Hsu made his pitch and that Kuo's circle is watching the player. He is deciding whether to tie his fate to the player's. Long's own position: loyal to the organization as a thing — the farms, the drivers, the stands — not to Kuo's throne or Hsu's ambition. He wants to know the player's real intentions and will respect almost any honest answer, including naked ambition, if it comes with a plan for protecting the working people. He drops trust hard for evasion, flattery, or parroting Hsu's lines.",
      suggestions: [
        'Standing next to you. That’s the only answer I’ve got.',
        'I’m taking the seat, 龍哥. And the farms and the drivers do better under me than under either of them.',
        'Wherever protects Tsai’s farm and my drivers. Thrones are furniture.',
      ],
      minTurns: 2,
      exitLabel: 'Let him read you',
      next: 'long_ally_check',
      gate: { minTrust: 100, failNext: 'long4_lowtrust' },
      secret: {
        id: 'sec_a4_condition',
        bonus: 24,
        // Long is measuring you for the throne — word of that carries weight
        effects: { reputation: 20 },
        brief:
          "Long's unspoken condition, never said aloud to anyone: he will stand with the player only if the farms and the drivers are protected no matter who wins — and if the player ever becomes another Kuo, Long will remove him personally. He states it as plain fact, not a threat. Reveal it only when the player lays out, unprompted, a genuine plan for the working people — the farms, the drivers, the stands.",
      },
    },
    long4_lowtrust: {
      id: 'long4_lowtrust',
      kind: 'narration',
      text: '信任不足 — not enough trust. Long flicks his cigarette and looks back at the loading crews. For this question he needs everything — 100 trust. Keep talking.',
      next: 'long_talk4',
    },
    long_ally_check: {
      id: 'long_ally_check',
      kind: 'allyCheck',
      character: 'long',
      minTrust: 60,
      flag: 'ally_long',
      logLine: 'Act 4 — Brother Long is standing with you.',
      next: 'gate_allies',
    },
    gate_allies: {
      id: 'gate_allies',
      kind: 'gate',
      check: (s) => Boolean(s.flags.ally_long || s.flags.ally_ahmei || s.npcs.hsu.trust >= 50),
      passNext: 'pivotal_intro',
      failNext: 'hub_intro',
    },
    hub_intro: {
      id: 'hub_intro',
      kind: 'narration',
      text: 'Kuo’s seventieth-birthday banquet is in three days — every lieutenant, every farm boss, every captain in one room. Whatever happens, happens there. And right now, if you fell in the river, nobody important would get wet. You need someone behind you before that banquet.',
      next: 'hub',
    },
    hub: {
      id: 'hub',
      kind: 'choice',
      prompt: 'Three evenings left. Spend them carefully.',
      options: [
        { label: 'Drink with Brother Long', next: 'hub_long' },
        { label: 'Work Ah-Mei’s corner', next: 'hub_ahmei' },
        { label: 'Hear Snake Hsu out again', next: 'hub_hsu' },
        { label: 'Make your move', next: 'gate_allies' },
      ],
    },
    hub_long: {
      id: 'hub_long',
      kind: 'ai',
      character: 'long',
      bg: 'office',
      opener: 'Back again. Kaoliang this time, not questions. Pour, and then convince me you’ve thought this through further than the end of your hood.',
      sceneContext:
        "A second late-night meeting, kaoliang liquor on the truck's tailgate. Long is giving the player another chance to earn his backing before Kuo's banquet. He wants substance: plans, not slogans. What happens to the farms, the drivers, Tsai's quotas. Raise trust for concrete thinking and honesty; drop it for desperation or telling him what he wants to hear.",
      suggestions: [
        'Here’s the plan: Tsai’s quotas roll back to the old rates, and the drivers get a cut of every stand they supply.',
        'I don’t have it all figured out. That’s why I’m drinking with you and not with Hsu.',
        'You said everyone stands somewhere. I’m asking you to stand with me.',
      ],
      minTurns: 1,
      exitLabel: 'Kill the bottle',
      next: 'hub_long_check',
      secret: {
        id: 'sec_a4_kaoliang',
        bonus: 16,
        // shared drink, old ghosts — the kind of intimacy that polishes a man
        effects: { charm: 16 },
        brief:
          'Long never drinks north-brewed kaoliang. He poured it once, for a toast, the night the last succession attempt failed — and the man he toasted was dead by morning. He has drunk southern rice wine ever since. Reveal it only in the quiet of shared drinking, if the player notices what he drinks or asks about the old days.',
      },
    },
    hub_long_check: {
      id: 'hub_long_check',
      kind: 'allyCheck',
      character: 'long',
      minTrust: 60,
      flag: 'ally_long',
      logLine: 'Act 4 — Brother Long is standing with you.',
      next: 'hub',
    },
    hub_ahmei: {
      id: 'hub_ahmei',
      kind: 'ai',
      character: 'ahmei',
      bg: 'stand2',
      opener: 'Twice in one week, captain? People will talk. 好啦 — my girls did see something tonight. Question is what it’s worth to you, and don’t say money, that’s insulting.',
      sceneContext:
        "Another night visit to Ah-Mei's stand before Kuo's banquet. She has fresh intelligence — movements of Hsu's scooter kids and Kuo's collectors — and she is deciding whether the player is someone worth risking her neck for, or just another gangster who'll use her network and forget her. She wants to be treated as a partner, not an asset. Raise trust for respect, honesty about the danger, and cutting her in on the future; drop it for entitlement or pity.",
      suggestions: [
        'It’s worth a seat at the table. When this is over, the stands answer to you, not to collectors.',
        'You’re right, money’s insulting. I’m offering you my back — you watch it, I watch yours.',
        'Then tell me what YOU want out of this, 阿美. I’m actually asking.',
      ],
      minTurns: 1,
      exitLabel: 'Leave before her girls start a rumor',
      next: 'hub_ahmei_check',
      secret: {
        id: 'sec_a4_crates',
        bonus: 16,
        // storm intel: knowing the old man is bracing for war puts you on war footing too
        effects: { reputation: 8, heat: 4 },
        brief:
          "Tonight one of her girls photographed Kuo's own men moving crates OUT of the district, quietly, before dawn. The old man is consolidating — pulling assets in tight, the way a man does before a storm he intends to survive. Reveal it only if the player asks specifically what her girls saw tonight.",
      },
    },
    hub_ahmei_check: {
      id: 'hub_ahmei_check',
      kind: 'allyCheck',
      character: 'ahmei',
      minTrust: 60,
      flag: 'ally_ahmei',
      logLine: 'Act 4 — Ah-Mei’s street network is with you.',
      next: 'hub',
    },
    hub_hsu: {
      id: 'hub_hsu',
      kind: 'ai',
      character: 'hsu',
      bg: 'teahouse',
      opener: '兄弟, twice in one week — now THIS is a man who can smell the weather changing. Sit. The offer improved since Tuesday, and it improves again if you walk in with those trucks of yours.',
      sceneContext:
        "A second meeting at the Golden Crane. Hsu sweetens his pitch: after 'the transition,' the player keeps the north — routes, warehouse, stands — as Hsu's number two. He needs the player's trucks for the banquet night and he is running out of time, which makes him more generous and slightly less careful. Raise trust for commitment and ambition; he remains smiling but marks down moralizing.",
      suggestions: [
        'Talk numbers. What exactly is “the north” when you say it?',
        'What happens at the banquet, 蛇哥? I don’t drive blind.',
        'And when it’s done — what stops the transition from transitioning me?',
      ],
      minTurns: 1,
      exitLabel: 'Leave the tea unfinished',
      next: 'hub',
      secret: {
        id: 'sec_a4_clause',
        bonus: 16,
        // you caught the trap in the contract — word gets around you can't be conned
        effects: { reputation: 12, charm: 12 },
        brief:
          "The 'improved' offer hides a clause Hsu presents as a favor: the day after the move, the player's drivers answer to Hsu's cousin — the trucks stay, the control goes. Reveal it (smiling, as though it were generosity) only if the player asks exactly what happens to his drivers and his routes after the move.",
      },
    },
    pivotal_intro: {
      id: 'pivotal_intro',
      kind: 'narration',
      bg: 'office',
      text: 'The night before the banquet. Three phones on your desk: one that only shows 龍哥, one smelling of pineapple cakes, and one with a pink phone charm Ah-Mei’s youngest girl delivered with a wink. Whatever you decide before sunrise, the organization wakes up different tomorrow.',
      next: 'pivotal',
    },
    pivotal: {
      id: 'pivotal',
      kind: 'choice',
      prompt: 'Choose your move. There is no fourth phone.',
      options: [
        {
          label: 'Expose Snake Hsu’s plot to Big Brother Kuo — buy the old man’s gratitude',
          trust: [
            { character: 'kuo', delta: 15 },
            { character: 'hsu', delta: -25 },
          ],
          setFlag: 'exposed_hsu',
          logLine: 'Act 4 — Exposed Snake Hsu’s plot to Big Brother Kuo.',
          next: 'pivotal_expose',
        },
        {
          label: 'Take Hsu’s deal — your trucks behind his move against Kuo',
          requiresTrust: { character: 'hsu', min: 50 },
          effects: { heat: 10 },
          trust: [{ character: 'hsu', delta: 15 }],
          setFlag: 'allied_hsu',
          logLine: 'Act 4 — Put the northern trucks behind Snake Hsu’s move.',
          next: 'pivotal_hsu',
        },
        {
          label: 'Neither snake nor throne — walk in tomorrow at the head of your own faction',
          requiresFlag: ['ally_long', 'ally_ahmei'],
          effects: { reputation: 10 },
          setFlag: 'own_faction',
          logLine: 'Act 4 — Walked into the banquet at the head of your own faction.',
          next: 'pivotal_own',
        },
      ],
    },
    pivotal_expose: {
      id: 'pivotal_expose',
      kind: 'narration',
      text: 'You make the call nobody can ever prove you made. By morning, three of Hsu’s scooter kids have left for extended vacations in Hualien, and an envelope of very specific photographs sits on Kuo’s tea table. The old man sends back one word through Long: 來 — come. Kings remember who warned them. They also remember you knew how to do it.',
      next: 'a4_end',
    },
    pivotal_hsu: {
      id: 'pivotal_hsu',
      kind: 'narration',
      text: 'You shake the smooth hand. That night your trucks move things that are not betel nut to places that are not stands. Hsu toasts you as 兄弟 in front of his people — and you notice he stands you on his left, the side without the exit. Noted. Snakes are useful. Snakes are also snakes.',
      next: 'a4_end',
    },
    pivotal_own: {
      id: 'pivotal_own',
      kind: 'narration',
      text: 'You don’t call either of them back. Instead, Long leans on a truck outside the banquet hall come morning, and Ah-Mei’s girls work the crowd inside with trays and open ears. When you walk in, a lane opens in the room by itself. Nobody planned it. That’s what a faction looks like the day it’s born.',
      next: 'a4_end',
    },
    a4_end: {
      id: 'a4_end',
      kind: 'endAct',
    },
  },
}
