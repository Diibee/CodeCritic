'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { checkAndGrantAchievements } from './achievements'
import { isPremium } from '@/lib/subscription'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { sendReviewNotification } from '@/lib/email'
import { isStaff } from '@/lib/staff'

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

  // Get project owner
  const { data: project } = await supabase
    .from('projects')
    .select('user_id, title')
    .eq('id', projectId)
    .single()

  if (project && project.user_id !== user.id) {
    await checkAndGrantAchievements(project.user_id)

    // Grant staff_reviewed achievement if reviewer is staff
    const reviewerIsStaff = await isStaff(user.id)
    if (reviewerIsStaff) {
      await supabaseAdmin.from('user_achievements').upsert(
        { user_id: project.user_id, achievement_key: 'staff_reviewed' },
        { onConflict: 'user_id,achievement_key' },
      )
    }

    // Send email notification if owner is Premium
    try {
      const ownerIsPremium = await isPremium(project.user_id)
      if (ownerIsPremium) {
        const { data: { user: ownerUser } } = await supabaseAdmin.auth.admin.getUserById(project.user_id)
        const { data: reviewerProfile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single()

        if (ownerUser?.email) {
          await sendReviewNotification({
            ownerEmail: ownerUser.email,
            ownerName: ownerUser.user_metadata?.full_name ?? 'there',
            projectTitle: project.title,
            projectId,
            reviewerName: reviewerProfile?.full_name ?? 'Someone',
          })
        }
      }
    } catch {
      // Email failure shouldn't break the review submission
    }
  }

  revalidatePath(`/projects/${projectId}`)
}
