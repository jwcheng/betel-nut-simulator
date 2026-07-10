import { createContext, useContext, type Dispatch } from 'react'
import type {
  ActDefinition,
  AllyCheckNode,
  CharacterId,
  ChoiceOption,
  Ending,
  GameState,
  NPCReply,
  NPCState,
  NodeId,
  PlayerStats,
} from '../types/game'
import { CHARACTERS } from './characters'
import { ACTS } from './acts'

export const INITIAL_STATS: PlayerStats = { cash: 8000, reputation: 5, charm: 20, heat: 0 }

function initialNpcs(): Record<CharacterId, NPCState> {
  const npcs = {} as Record<CharacterId, NPCState>
  for (const c of Object.values(CHARACTERS)) {
    npcs[c.id] = { trust: c.initialTrust, mood: 'neutral', history: [] }
  }
  return npcs
}

export function initialState(): GameState {
  return {
    phase: 'start',
    act: 1,
    nodeId: ACTS[0].start,
    bg: ACTS[0].defaultBg,
    stats: { ...INITIAL_STATS },
    npcs: initialNpcs(),
    flags: {},
    log: [],
  }
}

export type Action =
  | { type: 'START_GAME' }
  | { type: 'BEGIN_ACT' }
  | { type: 'GOTO'; node: NodeId }
  | { type: 'CHOOSE'; option: ChoiceOption }
  | { type: 'APPLY_EFFECTS'; nodeId: NodeId; effects: Partial<PlayerStats>; logLine?: string; next: NodeId }
  | { type: 'NPC_OPENER'; character: CharacterId; opener: string; nodeId: NodeId }
  | { type: 'NPC_TURN'; character: CharacterId; playerMessage: string; reply: NPCReply }
  | { type: 'ALLY_CHECK'; node: AllyCheckNode }
  | { type: 'END_ACT' }
  | { type: 'RESET' }

const clamp100 = (n: number) => Math.max(0, Math.min(100, n))

function applyEffects(stats: PlayerStats, fx: Partial<PlayerStats>): PlayerStats {
  return {
    cash: Math.max(0, stats.cash + (fx.cash ?? 0)),
    // reputation runs to 200; the rest cap at 100
    reputation: Math.max(0, Math.min(200, stats.reputation + (fx.reputation ?? 0))),
    charm: clamp100(stats.charm + (fx.charm ?? 0)),
    heat: clamp100(stats.heat + (fx.heat ?? 0)),
  }
}

export function currentAct(state: GameState): ActDefinition {
  return ACTS[state.act - 1]
}

function gotoNode(state: GameState, nodeId: NodeId): GameState {
  const node = currentAct(state).nodes[nodeId]
  return { ...state, nodeId, bg: node?.bg ?? state.bg }
}

export function computeEnding(state: GameState): Ending {
  const { reputation, heat, charm } = state.stats
  if (reputation < 45) {
    return {
      id: 'betrayed',
      title: 'Betrayed and Cast Out',
      titleZh: '眾叛親離',
      text: 'The banquet doors closed before you reached the table. The brothers you thought stood behind you had already counted your worth — and sold it. By dawn you were on a southbound bus with a broken hand and a warning: Taipei has a thousand neon stands, and not one of them will ever sell to you again. Kuo keeps his throne. The road keeps its silence.',
    }
  }
  if (state.flags.final_force || heat >= 60 || charm < 40) {
    return {
      id: 'coup',
      title: 'Bloody Coup',
      titleZh: '血洗王座',
      text: 'It took one night. The tea house burned to its beams, and by morning every stand from Wanxia to the river flew your colors. They obey you now — but obedience bought with blood needs blood to renew the lease. In the pink neon glow you catch your reflection in the glass of a betel nut booth, and for a moment you see an old man drinking tea alone. The throne is yours. So is the grave beside it.',
    }
  }
  return {
    id: 'succession',
    title: 'Negotiated Succession',
    titleZh: '禪讓大典',
    text: 'The old man poured the last cup himself. No guns, no fire — just names, territories, and a handshake witnessed by everyone who mattered. Kuo retires south to a farmhouse with a view of the betel palms he climbed as a boy. The stands stay lit, the trucks stay loaded, and the beauties from Wanxia to Binnan answer to you now. Ah-Mei runs the whole street network — she always did see everything. The empire changed hands the way the old ones say it should: quietly, over tea.',
  }
}

export function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'START_GAME': {
      if (state.phase !== 'start') return state
      return { ...state, phase: 'transition' }
    }

    case 'BEGIN_ACT': {
      if (state.phase !== 'transition') return state
      const act = currentAct(state)
      return { ...gotoNode({ ...state, phase: 'playing' }, act.start), bg: act.defaultBg }
    }

    case 'GOTO':
      return gotoNode(state, action.node)

    case 'CHOOSE': {
      const opt = action.option
      let next: GameState = { ...state, stats: opt.effects ? applyEffects(state.stats, opt.effects) : state.stats }
      for (const t of opt.trust ?? []) {
        const npc = next.npcs[t.character]
        next = {
          ...next,
          npcs: {
            ...next.npcs,
            [t.character]: { ...npc, trust: clamp100(npc.trust + t.delta) },
          },
        }
      }
      if (opt.setFlag) next = { ...next, flags: { ...next.flags, [opt.setFlag]: true } }
      if (opt.logLine) next = { ...next, log: [...next.log, opt.logLine] }
      return gotoNode(next, opt.next)
    }

    case 'APPLY_EFFECTS': {
      // idempotent: effects nodes fire once (guards StrictMode double-effects)
      const key = `fx_${state.act}_${action.nodeId}`
      if (state.flags[key]) return gotoNode(state, action.next)
      return gotoNode(
        {
          ...state,
          stats: applyEffects(state.stats, action.effects),
          flags: { ...state.flags, [key]: true },
          log: action.logLine ? [...state.log, action.logLine] : state.log,
        },
        action.next,
      )
    }

    case 'NPC_OPENER': {
      const key = `opened_${state.act}_${action.nodeId}`
      if (state.flags[key]) return state
      const npc = state.npcs[action.character]
      return {
        ...state,
        flags: { ...state.flags, [key]: true },
        npcs: {
          ...state.npcs,
          [action.character]: {
            ...npc,
            // each new encounter starts a clean transcript: previous
            // conversations are erased, only the fresh opener remains
            // (trust and mood carry over — people remember how you made
            // them feel, not what you said)
            history: [{ role: 'assistant', content: action.opener }],
          },
        },
      }
    }

    case 'NPC_TURN': {
      const npc = state.npcs[action.character]
      const charName = CHARACTERS[action.character].name

      // content line crossed: immediate ejection
      if (action.reply.flag === 'offensive') {
        return {
          ...state,
          phase: 'gameover',
          gameOver: {
            titleZh: '道上不收',
            title: 'The Street Spits You Out',
            text: `Some lines even this world won't cross. ${charName} goes very still, and the room goes cold around you. By morning the organization has erased your name from every ledger it keeps. The road home is the only road left.`,
          },
        }
      }

      const newTrust = clamp100(npc.trust + action.reply.trust_delta)
      const next: GameState = {
        ...state,
        stats: applyEffects(state.stats, {
          charm: action.reply.charm_delta ?? 0,
          reputation: action.reply.rep_delta ?? 0,
          heat: action.reply.heat_delta ?? 0,
        }),
        npcs: {
          ...state.npcs,
          [action.character]: {
            trust: newTrust,
            mood: action.reply.mood,
            history: [
              ...npc.history,
              { role: 'user', content: action.playerMessage },
              { role: 'assistant', content: action.reply.dialogue },
            ],
          },
        },
      }

      // trust bottomed out: the relationship — and the run — is over
      if (newTrust <= 0) {
        return {
          ...next,
          phase: 'gameover',
          gameOver: {
            titleZh: '橋斷了',
            title: 'The Bridge Is Burned',
            text: `${charName} is finished with you — completely. In this world, word travels faster than trucks: by morning every door in Wanxia is closed to your face. The climb ends here.`,
          },
        }
      }
      return next
    }

    case 'ALLY_CHECK': {
      const { node } = action
      const qualifies = state.npcs[node.character].trust >= node.minTrust
      if (!qualifies || state.flags[node.flag]) return gotoNode(state, node.next)
      return gotoNode(
        {
          ...state,
          flags: { ...state.flags, [node.flag]: true },
          log: [...state.log, node.logLine],
        },
        node.next,
      )
    }

    case 'END_ACT': {
      if (state.phase !== 'playing') return state
      if (state.act >= 5) {
        return { ...state, phase: 'ending', ending: computeEnding(state) }
      }
      const nextAct = ACTS[state.act]
      return {
        ...state,
        act: state.act + 1,
        phase: 'transition',
        nodeId: nextAct.start,
        bg: nextAct.defaultBg,
      }
    }

    case 'RESET':
      return initialState()

    default:
      return state
  }
}

export const GameContext = createContext<{
  state: GameState
  dispatch: Dispatch<Action>
} | null>(null)

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used inside GameContext provider')
  return ctx
}
