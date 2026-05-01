'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { checkAndGrantAchievements } from './achievements'
import { isPremium } from '@/lib/subscription'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { sendReviewNotification } from '@/lib/email'
import { isStaff } from '@/lib/staff'
import { rateLimit } from '@/lib/rateLimit'
import { sanitizeString, validateRating, isValidUUID } from '@/lib/validate'

const MIN_COMMENT_LENGTH = 20
const MAX_COMMENT_LENGTH = 2000
const MIN_ACCOUNT_AGE_HOURS = 1
const MAX_REVIEWS_PER_HOUR = 8

export async function submitReview(projectId: string, rating: number, comment: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be signed in to leave a review.' }

  // --- Input validation ---
  if (!isValidUUID(projectId)) return { error: 'Invalid project.' }

  const cleanComment = sanitizeString(comment, MAX_COMMENT_LENGTH).trim()
  if (cleanComment.length < MIN_COMMENT_LENGTH) {
    return { error: `Review must be at least ${MIN_COMMENT_LENGTH} characters.` }
  }

  const cleanRating = validateRating(rating)
  if (cleanRating === null) return { error: 'Rating must be between 1 and 5.' }

  // --- Minimum account age (prevents fresh throwaway accounts) ---
  const accountAgeHours = (Date.now() - new Date(user.created_at).getTime()) / 1000 / 60 / 60
  if (accountAgeHours < MIN_ACCOUNT_AGE_HOURS) {
    return { error: 'Your account is too new to leave reviews. Please wait a bit.' }
  }

  // --- Rate limit: max 8 reviews per hour ---
  const { allowed } = await rateLimit(`review:${user.id}`, MAX_REVIEWS_PER_HOUR, 60)
  if (!allowed) {
    return { error: 'You\'re submitting reviews too fast. Please wait before trying again.' }
  }

  // --- Prevent self-review (also enforced by RLS, but belt-and-suspenders) ---
  const { data: project } = await supabase
    .from('projects')
    .select('user_id, title')
    .eq('id', projectId)
    .single()

  if (!project) return { error: 'Project not found.' }
  if (project.user_id === user.id) return { error: 'You cannot review your own project.' }

  // --- Insert ---
  const { error } = await supabase.from('reviews').insert({
    project_id: projectId,
    reviewer_id: user.id,
    rating: cleanRating,
    comment: cleanComment,
  })

  if (error) {
    if (error.code === '23505') return { error: 'You have already reviewed this project.' }
    return { error: 'Failed to submit review. Please try again.' }
  }

  // --- Side effects (non-blocking) ---
  try {
    await checkAndGrantAchievements(user.id)
    await checkAndGrantAchievements(project.user_id)

    const reviewerIsStaff = await isStaff(user.id)
    if (reviewerIsStaff) {
      await supabaseAdmin.from('user_achievements').upsert(
        { user_id: project.user_id, achievement_key: 'staff_reviewed' },
        { onConflict: 'user_id,achievement_key' },
      )
    }

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
    // Side effects must never break the core action
  }

  revalidatePath(`/projects/${projectId}`)
  return { ok: true }
}
