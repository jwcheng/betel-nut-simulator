import { MOOD_TINTS, speakerStyle } from '../game/characters'
import type { Mood, SpeakerId } from '../types/game'

/**
 * Placeholder portrait: character glyph in a neon-ringed disc.
 * The ring + glow tint shifts with the NPC's current mood.
 */
export function Portrait({
  id,
  mood,
  size = 48,
}: {
  id: SpeakerId
  mood?: Mood
  size?: number
}) {
  const style = speakerStyle(id)
  const tint = mood ? MOOD_TINTS[mood] : style.color
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-display font-bold transition-all duration-500"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.45,
        color: style.color,
        background: 'rgba(7,7,15,0.85)',
        border: `2px solid ${tint}`,
        boxShadow: `0 0 12px ${tint}66, inset 0 0 8px ${tint}22`,
      }}
    >
      {style.glyph}
    </div>
  )
}
