import type { ActDefinition } from '../../types/game'
import templeImg from '../../assets/backgrounds/temple.jpeg'

export const act5: ActDefinition = {
  id: 5,
  title: 'The Throne',
  titleZh: '王座',
  tagline: 'Every man who took a throne dug a grave beside it. The old man dug his forty years ago and kept it swept.',
  cardGradient: 'linear-gradient(160deg, #080704 0%, #201806 60%, #453308 100%)',
  glyph: '王',
  defaultBg: 'temple',
  gateDescription: 'The final conversation. Everything you built walks in with you.',
  backgrounds: {
    temple: {
      gradient: 'linear-gradient(180deg, #0a0805 0%, #1e1708 55%, #3d2e0c 100%)',
      glyph: '王',
      label: 'Longevity Tea House · the back room',
      imageUrl: templeImg,
    },
  },
  start: 'a5_intro',
  nodes: {
    a5_intro: {
      id: 'a5_intro',
      kind: 'narration',
      text: 'The banquet roars downstairs — seventy years of Big Brother Kuo toasted in kaoliang and fear. But the summons comes quietly, from a waiter who is not a waiter: the back room, alone. The room smells of sandalwood and gun oil. An altar of Guan Gong watches from the wall, red bulb glowing. At a bare wooden table, the old man pours tea into two cups with a hand that does not shake.',
      next: 'kuo_line1',
    },
    kuo_line1: {
      id: 'kuo_line1',
      kind: 'line',
      speaker: 'kuo',
      text: 'Sit. I poured for two. Forty years I’ve poured for two at this table, and the second chair is never empty long.',
      next: 'kuo_line2',
    },
    kuo_line2: {
      id: 'kuo_line2',
      kind: 'line',
      speaker: 'kuo',
      text: 'Barefoot on a farm in the south. Then a truck. Then a name. Then a floor of a warehouse, then a district, then this room. I know your whole life, young one — because it was mine first. So let’s not waste an old man’s evening. Tell me why you’re here.',
      next: 'kuo_talk',
    },
    kuo_talk: {
      id: 'kuo_talk',
      kind: 'ai',
      character: 'kuo',
      opener: 'And before you answer — know that I have had this conversation three times before, in this room, over this same tea set. The other three men lied to me. They are not retired.',
      sceneContext:
        "The back room of the Longevity Tea House, during Kuo's seventieth-birthday banquet. The final confrontation. The player has come up exactly the way Kuo did — farm, truck, name — and both of them know why the player is in this room: the succession, one way or another. Kuo is testing the player one last time: honesty about ambition interests him; lies about it disgust him; grovelling and empty threats disgust him equally. He speaks in tea, roots, and graves. Depending on the conversation he may lean toward yielding the operation with terms, or toward having the player removed. He is not afraid; he has survived three coups and the pistol in the table drawer is not a metaphor.",
      suggestions: [
        'I’m here for the chair, 郭大哥. You knew before I knocked. I won’t insult you by lying about it.',
        'I came to hear what forty years in that chair actually cost. Then I’ll tell you my price for taking it.',
        'The farms are bleeding and the streets know it. I’m here so the thing you built outlives you.',
      ],
      minTurns: 3,
      exitLabel: 'Make your final move',
      next: 'final_choice',
      gate: { minTrust: 100, failNext: 'kuo_lowtrust' },
    },
    kuo_lowtrust: {
      id: 'kuo_lowtrust',
      kind: 'narration',
      text: '信任不足 — not enough trust. The old man refills your cup without a word. For the chair itself he needs everything you have — 100 trust. The tea isn’t finished.',
      next: 'kuo_talk',
    },
    final_choice: {
      id: 'final_choice',
      kind: 'choice',
      prompt: 'The tea is finished. The old man sets down his cup and waits. Downstairs, someone is singing badly. Choose.',
      options: [
        {
          label: 'Take it by force — his time is over, tonight',
          setFlag: 'final_force',
          effects: { heat: 10 },
          logLine: 'Act 5 — Took the throne by force at the Longevity Tea House.',
          next: 'final_force_out',
        },
        {
          label: 'Offer succession — his name honored, his people kept whole, his exit paid',
          requiresStat: { stat: 'charm', min: 40 },
          requiresTrust: { character: 'kuo', min: 45 },
          setFlag: 'final_talk',
          logLine: 'Act 5 — Negotiated the succession over the last pot of tea.',
          next: 'final_talk_out',
        },
        {
          label: 'Refill his cup first — ask him to hand it down as a teacher, not lose it as a mark',
          requiresTrust: { character: 'kuo', min: 60 },
          setFlag: 'final_talk',
          trust: [{ character: 'kuo', delta: 10 }],
          logLine: 'Act 5 — Asked Kuo to pass the empire down as a teacher, and he poured.',
          next: 'final_kneel_out',
        },
      ],
    },
    final_force_out: {
      id: 'final_force_out',
      kind: 'narration',
      text: 'You stand. So does everything you brought with you — the men outside the door, the trucks in the alley, the years of night highway in your shoulders. The old man looks at the drawer, measures the arithmetic, and for the first time all evening looks his age. What happens next happens quickly, and the banquet downstairs never misses a verse.',
      next: 'a5_end',
    },
    final_talk_out: {
      id: 'final_talk_out',
      kind: 'narration',
      text: 'You lay it out like a manifest: his name on the wall of every stand, his people folded into yours, a farmhouse in the south with a view of betel palms, and numbers — real ones — for his retirement. The old man listens with his eyes closed, like a man checking a truck’s engine by sound. Then he opens them, and pours the last of the pot into your cup first.',
      next: 'a5_end',
    },
    final_kneel_out: {
      id: 'final_kneel_out',
      kind: 'narration',
      text: 'You lift the pot and fill his cup the way a student fills a teacher’s — both hands, to the brim. The room is silent except for the red bulb’s hum above Guan Gong. "Three men lied to me at this table," he says at last. "You’re the first one who poured." He reaches into the drawer — and lays a worn brass warehouse key between the two cups.',
      next: 'a5_end',
    },
    a5_end: {
      id: 'a5_end',
      kind: 'endAct',
    },
  },
}
