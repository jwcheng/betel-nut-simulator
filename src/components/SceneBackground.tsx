import type { BackgroundSpec } from '../types/game'

/**
 * Illustrated panel slot. Renders `imageUrl` when supplied; otherwise a
 * tasteful gradient + giant CJK glyph placeholder carries the scene.
 */
export function SceneBackground({ spec }: { spec: BackgroundSpec }) {
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: spec.gradient }}>
      {spec.imageUrl ? (
        <img
          src={spec.imageUrl}
          alt={spec.label}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="font-display select-none text-[min(55vw,340px)] leading-none text-white/6 animate-flicker"
            aria-hidden
          >
            {spec.glyph}
          </span>
        </div>
      )}
      {/* vignette so the dialogue layer always reads */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.55)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/70 to-transparent" />
      <div className="absolute left-3 top-14 rounded border border-white/10 bg-black/40 px-2 py-0.5 text-[11px] tracking-wide text-white/60 backdrop-blur-sm">
        {spec.label}
      </div>
    </div>
  )
}
