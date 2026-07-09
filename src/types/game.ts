export type CharacterId = 'ahmei' | 'long' | 'tsai' | 'hsu' | 'kuo'
export type SpeakerId = CharacterId | 'narrator' | 'player'

export type Mood = 'friendly' | 'neutral' | 'suspicious' | 'hostile' | 'impressed'

export interface PlayerStats {
  cash: number
  reputation: number
  charm: number
  heat: number
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface NPCReply {
  dialogue: string
  trust_delta: number
  mood: Mood
}

export interface NPCState {
  trust: number
  mood: Mood
  history: ChatMessage[]
}

export interface Character {
  id: CharacterId
  name: string
  nameZh: string
  role: string
  color: string
  glyph: string
  systemPrompt: string
  fallbackLines: string[]
  initialTrust: number
}

export interface BackgroundSpec {
  gradient: string
  glyph: string
  label: string
  imageUrl?: string
}

export type NodeId = string

interface BaseNode {
  id: NodeId
  /** switches the scene background when this node is entered */
  bg?: string
}

export interface NarrationNode extends BaseNode {
  kind: 'narration'
  text: string
  next: NodeId
}

export interface LineNode extends BaseNode {
  kind: 'line'
  speaker: SpeakerId
  text: string
  next: NodeId
}

export interface ChoiceOption {
  label: string
  next: NodeId
  effects?: Partial<PlayerStats>
  trust?: { character: CharacterId; delta: number }[]
  setFlag?: string
  logLine?: string
  requiresStat?: { stat: keyof PlayerStats; min: number }
  requiresTrust?: { character: CharacterId; min: number }
  /** single flag, or "any of" when an array */
  requiresFlag?: string | string[]
}

export interface ChoiceNode extends BaseNode {
  kind: 'choice'
  prompt?: string
  options: ChoiceOption[]
}

export interface AINode extends BaseNode {
  kind: 'ai'
  character: CharacterId
  /** NPC's scripted first line, pushed to history once per node */
  opener: string
  /** extra scene framing injected into the system prompt for this conversation */
  sceneContext: string
  suggestions: string[]
  /** player turns required before the exit button unlocks */
  minTurns: number
  exitLabel: string
  next: NodeId
  gate?: { minTrust: number; failNext: NodeId }
}

export interface EffectsNode extends BaseNode {
  kind: 'effects'
  effects: Partial<PlayerStats>
  note?: string
  logLine?: string
  next: NodeId
}

export interface GateNode extends BaseNode {
  kind: 'gate'
  check: (s: GameState) => boolean
  passNext: NodeId
  failNext: NodeId
}

export interface AllyCheckNode extends BaseNode {
  kind: 'allyCheck'
  character: CharacterId
  minTrust: number
  flag: string
  logLine: string
  next: NodeId
}

export interface EndActNode extends BaseNode {
  kind: 'endAct'
}

export type SceneNode =
  | NarrationNode
  | LineNode
  | ChoiceNode
  | AINode
  | EffectsNode
  | GateNode
  | AllyCheckNode
  | EndActNode

export interface ActDefinition {
  id: number
  title: string
  titleZh: string
  tagline: string
  cardGradient: string
  glyph: string
  backgrounds: Record<string, BackgroundSpec>
  defaultBg: string
  start: NodeId
  nodes: Record<NodeId, SceneNode>
  gateDescription: string
}

export type EndingId = 'coup' | 'succession' | 'betrayed'

export interface Ending {
  id: EndingId
  title: string
  titleZh: string
  text: string
}

export type Phase = 'start' | 'transition' | 'playing' | 'ending'

export interface GameState {
  phase: Phase
  act: number
  nodeId: NodeId
  bg: string
  stats: PlayerStats
  npcs: Record<CharacterId, NPCState>
  flags: Record<string, boolean>
  log: string[]
  ending?: Ending
}
