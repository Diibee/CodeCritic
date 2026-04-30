'use server'

import { createClient } from '@/lib/supabase/server'
import type { AchievementKey } from '@/lib/achievements'

// Early adopter cutoff: anyone who joined before June 2026
const EARLY_ADOPTER_CUTOFF = new Date('2026-06-01')

export async function checkAndGrantAchievements(userId: string) {
  const supabase = await createClient()

  // Fetch already-earned achievements
  const { data: existing } = await supabase
    .from('user_achievements')
    .select('achievement_key')
    .eq('user_id', userId)

  const earned = new Set(existing?.map((a) => a.achievement_key) ?? [])
  const toGrant: AchievementKey[] = []

  function maybeGrant(key: AchievementKey) {
    if (!earned.has(key)) toGrant.push(key)
  }

  // Fetch user's public projects with reviews
  const { data: projects } = await supabase
    .from('projects')
    .select('id, tech_stack, ai_review, reviews(rating)')
    .eq('user_id', userId)
    .eq('is_public', true)

  const projectCount = projects?.length ?? 0
  const totalReviewsReceived = projects?.reduce((acc, p) => acc + (p.reviews?.length ?? 0), 0) ?? 0
  const allRatings = (projects ?? []).flatMap((p) =>
    (p.reviews ?? []).map((r: { rating: number }) => r.rating)
  )
  const avgRating =
    allRatings.length > 0 ? allRatings.reduce((a, b) => a + b, 0) / allRatings.length : 0
  const techStacks = new Set((projects ?? []).flatMap((p) => p.tech_stack ?? []))
  const hasAiReview = (projects ?? []).some((p) => p.ai_review)

  // Fetch reviews given by user
  const { count: reviewsGiven } = await supabase
    .from('reviews')
    .select('*', { count: 'exact', head: true })
    .eq('reviewer_id', userId)

  const reviewsGivenCount = reviewsGiven ?? 0

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, bio, avatar_url, created_at')
    .eq('id', userId)
    .single()

  // ── Getting Started ──────────────────────────────────────────
  if (projectCount >= 1) maybeGrant('first_project')
  if (reviewsGivenCount >= 1) maybeGrant('first_review_given')
  if (totalReviewsReceived >= 1) maybeGrant('first_review_received')
  if (profile?.full_name && profile?.bio && profile?.avatar_url) maybeGrant('profile_complete')

  // ── Reviewer ─────────────────────────────────────────────────
  if (reviewsGivenCount >= 5)   maybeGrant('reviewer_5')
  if (reviewsGivenCount >= 25)  maybeGrant('reviewer_25')
  if (reviewsGivenCount >= 100) maybeGrant('reviewer_100')
  if (reviewsGivenCount >= 500) maybeGrant('reviewer_500')

  // ── Creator ──────────────────────────────────────────────────
  if (projectCount >= 3)  maybeGrant('creator_3')
  if (projectCount >= 10) maybeGrant('creator_10')

  // ── Popularity ───────────────────────────────────────────────
  if (totalReviewsReceived >= 10)   maybeGrant('popular_10')
  if (totalReviewsReceived >= 50)   maybeGrant('popular_50')
  if (totalReviewsReceived >= 100)  maybeGrant('popular_100')
  if (totalReviewsReceived >= 500)  maybeGrant('popular_500')
  if (totalReviewsReceived >= 1000) maybeGrant('popular_1000')

  // ── Quality ──────────────────────────────────────────────────
  if (allRatings.length >= 3  && avgRating >= 4.0) maybeGrant('rising_star')
  if (allRatings.length >= 10 && avgRating >= 4.5) maybeGrant('top_rated')
  if (allRatings.length >= 25 && avgRating >= 4.8) maybeGrant('gold_standard')

  // ── AI ───────────────────────────────────────────────────────
  if (hasAiReview) maybeGrant('ai_reviewed')

  // ── Special ──────────────────────────────────────────────────
  if (profile?.created_at && new Date(profile.created_at) < EARLY_ADOPTER_CUTOFF) {
    maybeGrant('early_adopter')
  }
  if (techStacks.size >= 5) maybeGrant('all_tech')

  // leaderboard_top3: check if any project is in top 3 by avg rating (min 2 reviews)
  const { data: allProjects } = await supabase
    .from('projects')
    .select('id, user_id, reviews(rating)')
    .eq('is_public', true)

  const ranked = (allProjects ?? [])
    .filter((p) => (p.reviews?.length ?? 0) >= 2)
    .map((p) => {
      const reviews = (p.reviews ?? []) as { rating: number }[]
      const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      return { user_id: p.user_id, avg }
    })
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 3)

  if (ranked.some((p) => p.user_id === userId)) maybeGrant('leaderboard_top3')

  // Grant new achievements
  if (toGrant.length > 0) {
    await supabase.from('user_achievements').insert(
      toGrant.map((key) => ({ user_id: userId, achievement_key: key }))
    )
  }

  return toGrant
}
