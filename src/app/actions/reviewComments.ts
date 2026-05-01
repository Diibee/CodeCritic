'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rateLimit'
import { sanitizeString, isValidUUID } from '@/lib/validate'

const MAX_COMMENT_LENGTH = 1000
const MIN_COMMENT_LENGTH = 2

export async function addReviewComment(reviewId: string, projectId: string, comment: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  if (!isValidUUID(reviewId) || !isValidUUID(projectId)) throw new Error('Invalid request.')

  const clean = sanitizeString(comment, MAX_COMMENT_LENGTH).trim()
  if (clean.length < MIN_COMMENT_LENGTH) throw new Error('Comment is too short.')

  const { allowed } = await rateLimit(`comment:${user.id}`, 20, 60)
  if (!allowed) throw new Error('You are commenting too fast. Please slow down.')

  const { error } = await supabase
    .from('review_comments')
    .insert({ review_id: reviewId, user_id: user.id, comment: clean })
  if (error) throw new Error(error.message)

  revalidatePath(`/projects/${projectId}`)
}

export async function deleteReviewComment(commentId: string, projectId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  if (!isValidUUID(commentId) || !isValidUUID(projectId)) throw new Error('Invalid request.')

  await supabase.from('review_comments').delete().eq('id', commentId).eq('user_id', user.id)
  revalidatePath(`/projects/${projectId}`)
}
