'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function toggleFollow(targetUserId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  if (user.id === targetUserId) throw new Error('Cannot follow yourself')

  const { data: existing } = await supabase
    .from('follows')
    .select('follower_id')
    .eq('follower_id', user.id)
    .eq('following_id', targetUserId)
    .maybeSingle()

  if (existing) {
    await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', targetUserId)
  } else {
    await supabase.from('follows').insert({ follower_id: user.id, following_id: targetUserId })
  }

  revalidatePath(`/u/${targetUserId}`)
}
