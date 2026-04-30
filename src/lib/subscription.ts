import { createClient } from '@/lib/supabase/server'

export async function isPremium(userId: string): Promise<boolean> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('subscriptions')
      .select('status')
      .eq('user_id', userId)
      .single()
    return data?.status === 'active'
  } catch {
    return false
  }
}
