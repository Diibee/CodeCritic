'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function addReviewComment(reviewId: string, projectId: string, comment: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('review_comments')
    .insert({ review_id: reviewId, user_id: user.id, comment })
  if (error) throw new Error(error.message)

  revalidatePath(`/projects/${projectId}`)
}

export async function deleteReviewComment(commentId: string, projectId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  await supabase.from('review_comments').delete().eq('id', commentId).eq('user_id', user.id)
  revalidatePath(`/projects/${projectId}`)
}
