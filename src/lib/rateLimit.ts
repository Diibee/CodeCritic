import { supabaseAdmin } from './supabase/admin'

/**
 * Sliding fixed-window rate limiter backed by Supabase.
 * Uses an atomic RPC so concurrent requests don't bypass the limit.
 *
 * @param key       Unique identifier for this bucket (e.g. `review:${userId}`)
 * @param max       Max requests allowed in the window
 * @param minutes   Window size in minutes
 */
export async function rateLimit(
  key: string,
  max: number,
  minutes: number,
): Promise<{ allowed: boolean; remaining: number }> {
  try {
    const windowMs = minutes * 60 * 1000
    const windowStart = new Date(Math.floor(Date.now() / windowMs) * windowMs).toISOString()

    const { data: count, error } = await supabaseAdmin.rpc('increment_rate_limit', {
      p_key: key,
      p_window_start: windowStart,
    })

    if (error) {
      // Fail open — don't block users if rate limit DB is unavailable
      console.error('[rateLimit] RPC error:', error.message)
      return { allowed: true, remaining: max }
    }

    const current = count as number
    return {
      allowed: current <= max,
      remaining: Math.max(0, max - current),
    }
  } catch (err) {
    console.error('[rateLimit] unexpected error:', err)
    return { allowed: true, remaining: max }
  }
}
