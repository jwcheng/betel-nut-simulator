import type { AINode, PlayerStats } from '../types/game'
import { ACTS } from './acts'

type SecretDef = NonNullable<AINode['secret']>

/** every secret in the game, keyed by its flag id — single source of truth for worth displays */
export const SECRET_DEFS: Record<string, SecretDef> = {}
for (const act of ACTS) {
  for (const node of Object.values(act.nodes)) {
    if (node.kind === 'ai' && node.secret) SECRET_DEFS[node.secret.id] = node.secret
  }
}

/** "+20 trust · +20 charm · -4 heat" — full payout line for a secret */
export function secretWorth(bonus: number, effects?: Partial<PlayerStats>): string {
  const sign = (n: number) => (n > 0 ? `+${n}` : `${n}`)
  const parts = [`${sign(bonus)} trust`]
  const e = effects ?? {}
  if (e.cash) parts.push(`${sign(e.cash)} cash`)
  if (e.reputation) parts.push(`${sign(e.reputation)} rep`)
  if (e.charm) parts.push(`${sign(e.charm)} charm`)
  if (e.heat) parts.push(`${sign(e.heat)} heat`)
  return parts.join(' · ')
}
