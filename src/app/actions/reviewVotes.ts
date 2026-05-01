'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function toggleReviewVote(reviewId: string, projectId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: existing } = await supabase
    .from('review_votes')
    .select('review_id')
    .eq('review_id', reviewId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) {
    await supabase.from('review_votes').delete().eq('review_id', reviewId).eq('user_id', user.id)
  } else {
    await supabase.from('review_votes').insert({ review_id: reviewId, user_id: user.id })
  }

  revalidatePath(`/projects/${projectId}`)
}
