import type { ActDefinition } from '../types/game'

const ACT_NUMERALS = ['一', '二', '三', '四', '五']

export function ActTransition({
  act,
  onContinue,
}: {
  act: ActDefinition
  onContinue: () => void
}) {
  return (
    <div
      className="absolute inset-0 z-30 flex flex-col items-center justify-center overflow-hidden px-6 text-center"
      style={{ background: act.cardGradient }}
    >
      <span
        className="pointer-events-none absolute font-display text-[min(80vw,480px)] leading-none text-white/5 select-none"
        aria-hidden
      >
        {act.glyph}
      </span>
      {/* scrim so the card text reads on every act's gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.35) 100%)',
        }}
      />

      <div className="animate-rise relative flex flex-col items-center">
        <span className="mb-3 text-xs uppercase tracking-[0.4em] text-white/60">
          第{ACT_NUMERALS[act.id - 1]}幕 · Act {act.id}
        </span>
        <h1 className="font-display text-4xl font-black text-neon-pink neon-text sm:text-5xl">
          {act.titleZh}
        </h1>
        <h2 className="mt-2 font-display text-xl font-bold tracking-widest text-white/90">
          {act.title}
        </h2>
        <p className="mt-6 max-w-md text-sm italic leading-relaxed text-white/80">
          {act.tagline}
        </p>
        <p className="mt-4 max-w-md text-[11px] uppercase tracking-wider text-white/50">
          {act.gateDescription}
        </p>
        <button
          type="button"
          onClick={onContinue}
          className="mt-10 rounded-lg border border-neon-pink/60 bg-black/40 px-8 py-3 font-display text-sm font-bold tracking-widest text-white transition-all hover:bg-neon-pink/20 hover:shadow-[0_0_24px_rgba(255,45,120,0.45)]"
        >
          進入 · ENTER
        </button>
      </div>
    </div>
  )
}
