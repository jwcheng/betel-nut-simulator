import { useEffect, useState } from 'react'
import { checkAiLive } from '../api/openrouter'

/**
 * Whether AI dialogue is available (the server proxy has a key configured).
 * Optimistic: assumes live until the one-time health check says otherwise,
 * so the common case never flashes an "offline" badge.
 */
export function useAiLive(): boolean {
  const [live, setLive] = useState(true)
  useEffect(() => {
    let mounted = true
    checkAiLive().then((v) => {
      if (mounted) setLive(v)
    })
    return () => {
      mounted = false
    }
  }, [])
  return live
}
