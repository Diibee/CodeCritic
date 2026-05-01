import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function isPremium(userId: string): Promise<boolean> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('subscriptions')
      .select('status')
      .eq('user_id', userId)
      .single()

    const active = data?.status === 'active'

    // If no longer premium, clean up featured projects
    if (!active) {
      await supabaseAdmin
        .from('projects')
        .update({ is_featured: false })
        .eq('user_id', userId)
        .eq('is_featured', true)
    }

    return active
  } catch {
    return false
  }
}
