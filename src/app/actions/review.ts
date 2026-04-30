'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { checkAndGrantAchievements } from './achievements'

export async function submitReview(projectId: string, rating: number, comment: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase.from('reviews').insert({
    project_id: projectId,
    reviewer_id: user.id,
    rating,
    comment: comment.trim(),
  })

  if (error) throw new Error(error.message)

  // Check achievements for the reviewer
  await checkAndGrantAchievements(user.id)

  // Check achievements for the project owner
  const { data: project } = await supabase
    .from('projects')
    .select('user_id')
    .eq('id', projectId)
    .single()

  if (project && project.user_id !== user.id) {
    await checkAndGrantAchievements(project.user_id)
  }

  revalidatePath(`/projects/${projectId}`)
}
