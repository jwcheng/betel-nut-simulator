import type { ReactNode } from 'react'
import { speakerStyle } from '../game/characters'
import type { Mood, SpeakerId } from '../types/game'
import { Portrait } from './Portrait'

/**
 * Classic bottom-anchored VN text box. Tap anywhere on it to advance
 * when `onNext` is provided.
 */
export function DialogueBox({
  speaker,
  text,
  mood,
  onNext,
  children,
}: {
  speaker: SpeakerId
  text: string
  mood?: Mood
  onNext?: () => void
  children?: ReactNode
}) {
  const style = speakerStyle(speaker)
  const isNarrator = speaker === 'narrator'

  return (
    <div
      className={`relative w-full rounded-xl border border-white/10 bg-noir-900/90 p-4 pb-5 shadow-[0_8px_40px_rgba(0,0,0,0.6)] backdrop-blur-md ${onNext ? 'cursor-pointer' : ''}`}
      onClick={onNext}
      role={onNext ? 'button' : undefined}
    >
      {!isNarrator && (
        <div className="absolute -top-4 left-3 flex items-center gap-2">
          <Portrait id={speaker} mood={mood} size={40} />
          <span
            className="rounded-full px-3 py-0.5 font-display text-sm font-bold tracking-wide"
            style={{
              color: '#fff',
              background: `${style.color}cc`,
              boxShadow: `0 0 10px ${style.color}88`,
            }}
          >
            {style.name}
          </span>
        </div>
      )}
      <div key={text} className={`animate-rise ${!isNarrator ? 'mt-5' : ''}`}>
        <p
          className={`text-[15px] leading-relaxed ${isNarrator ? 'italic text-white/75' : 'text-white/95'}`}
        >
          {text}
        </p>
        {children}
      </div>
      {onNext && (
        <span className="absolute bottom-1.5 right-3 text-xs text-neon-pink animate-blink">
          ▼
        </span>
      )}
    </div>
  )
}
