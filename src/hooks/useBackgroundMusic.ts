import { useEffect, useRef, useState } from 'react'

export const TRACKS = {
  /** mellow theme: title screen, instructions, act 2, and the credits */
  taiwan: '/audio/taiwan.mp3',
  /** driving theme: acts 1, 3, and 4 */
  underworld: '/audio/theme.mp3',
  /** finale: act 5 */
  stretch: '/audio/stretch.mp3',
}

const VOLUME = 0.35

/**
 * Looping background music with track switching. Pass the URL of the track
 * that should be playing right now; when it changes, playback swaps over.
 *
 * Self-healing playback: browsers block autoplay before a user gesture, and
 * OS media keys / audio interruptions can pause us — so resume listeners
 * stay attached for the whole session, and any interaction restarts a
 * paused track. An explicit `ended` handler backstops `loop`.
 */
export function useBackgroundMusic(trackUrl: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [muted, setMuted] = useState(false)
  // true when the browser's autoplay policy blocked us and we're waiting on
  // the first user gesture — lets the UI show a "click for sound" hint
  const [blocked, setBlocked] = useState(false)

  useEffect(() => {
    const audio = new Audio()
    audio.loop = true
    audio.volume = VOLUME
    audio.preload = 'auto'
    audioRef.current = audio

    const onPlaying = () => setBlocked(false)
    audio.addEventListener('playing', onPlaying)

    const resume = () => {
      if (audio.paused && audio.src) audio.play().catch(() => {})
    }
    window.addEventListener('pointerdown', resume)
    window.addEventListener('keydown', resume)
    window.addEventListener('touchstart', resume)

    const onEnded = () => {
      audio.currentTime = 0
      audio.play().catch(() => {})
    }
    audio.addEventListener('ended', onEnded)

    return () => {
      window.removeEventListener('pointerdown', resume)
      window.removeEventListener('keydown', resume)
      window.removeEventListener('touchstart', resume)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('playing', onPlaying)
      audio.pause()
      audioRef.current = null
    }
  }, [])

  // swap tracks whenever the desired URL changes (and kick off the first one)
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    if (!audio.src || !audio.src.endsWith(trackUrl)) {
      audio.src = trackUrl
      audio.play().catch(() => {
        // autoplay blocked — the resume listeners handle it on first interaction
        setBlocked(true)
      })
    }
  }, [trackUrl])

  function toggleMute() {
    setMuted((m) => {
      const next = !m
      if (audioRef.current) audioRef.current.muted = next
      return next
    })
  }

  return { muted, toggleMute, blocked }
}
